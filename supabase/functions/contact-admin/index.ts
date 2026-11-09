// Contact de l'administratrice : envoie un signalement de bug ou une suggestion par e-mail (Resend).
//
// Secrets à définir (npx supabase secrets set NOM=valeur) :
//   RESEND_API_KEY  clé API Resend (obligatoire)
//   ADMIN_EMAIL     adresse qui reçoit les messages (obligatoire)
//   RESEND_FROM     expéditeur, ex. "SideQuest <contact@mondomaine.fr>" (facultatif ;
//                   par défaut l'adresse de test de Resend, qui n'envoie qu'au propriétaire du compte Resend)
//
// SUPABASE_URL et SUPABASE_ANON_KEY sont fournis automatiquement par Supabase.

import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_MESSAGE_LENGTH = 5000;
const TYPES = { bug: "Bug", suggestion: "Suggestion" } as const;

/** Tout texte venant de l'utilisateur est échappé avant d'entrer dans le HTML. */
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const BADGE = {
  bug: { label: "🐞 Bug", color: "#fda4af", bg: "#4c1d2e", border: "#9f3a55" },
  suggestion: { label: "💡 Idée", color: "#fcd34d", bg: "#45330f", border: "#a07a1f" },
} as const;

/** E-mail HTML aux couleurs de l'app (tableaux et styles en ligne pour Gmail / Outlook). */
function renderHtml(p: { type: "bug" | "suggestion"; message: string; username: string; email: string; userId: string; context: string }) {
  const font = "font-family:Segoe UI, Helvetica, Arial, sans-serif;";
  const badge = BADGE[p.type];
  const body = escapeHtml(p.message).replace(/\r?\n/g, "<br>");
  const author = p.username ? `${escapeHtml(p.username)} · ${escapeHtml(p.email)}` : escapeHtml(p.email);
  const reply = p.email
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;"><tr>
         <td bgcolor="#7c3aed" style="border-radius:12px;">
           <a href="mailto:${escapeHtml(p.email)}?subject=${encodeURIComponent(`Re: ton message SideQuest`)}" style="display:inline-block; padding:12px 24px; ${font} font-size:13px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#ffffff; text-decoration:none; border-radius:12px; border:1px solid #a78bfa;">Répondre</a>
         </td></tr></table>`
    : "";

  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="dark"></head>
<body style="margin:0; padding:0; background-color:#140c26;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#140c26;"><tr><td align="center" style="padding:32px 16px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">
    <tr><td align="center" style="padding-bottom:20px; ${font} font-size:20px; font-weight:800; letter-spacing:1px; color:#e9e2ff;">⚔️ SideQuest</td></tr>
    <tr><td style="background-color:#22163d; border:1px solid #4a3a78; border-radius:18px; padding:28px; ${font}">
      <span style="display:inline-block; padding:4px 10px; border-radius:999px; background-color:${badge.bg}; border:1px solid ${badge.border}; color:${badge.color}; font-size:12px; font-weight:700;">${badge.label}</span>
      <div style="margin-top:14px; font-size:13px; color:#a99fcf;">De <strong style="color:#ffffff;">${author}</strong></div>
      <div style="margin-top:18px; padding:16px 18px; background-color:#170f2c; border:1px solid #3a2d63; border-radius:12px; font-size:15px; line-height:1.6; color:#e6e0fa;">${body}</div>
      ${reply}
    </td></tr>
    <tr><td style="padding:18px 8px 0; ${font} font-size:11px; line-height:1.6; color:#6f6593;">
      ${p.context ? `${escapeHtml(p.context)}<br>` : ""}Utilisateur : ${escapeHtml(p.userId)}
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;
}

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return json(405, { error: "Méthode non autorisée." });

  const resendKey = Deno.env.get("RESEND_API_KEY");
  const adminEmail = Deno.env.get("ADMIN_EMAIL");
  if (!resendKey || !adminEmail) return json(500, { error: "Le contact n'est pas configuré." });

  // Seuls les utilisateurs connectés peuvent écrire : on vérifie leur jeton de session.
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return json(401, { error: "Connexion requise." });
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return json(401, { error: "Session invalide, reconnecte-toi." });

  let payload: { type?: string; message?: string; context?: string };
  try {
    payload = await req.json();
  } catch {
    return json(400, { error: "Requête invalide." });
  }

  const type = payload.type === "bug" || payload.type === "suggestion" ? payload.type : null;
  const message = (payload.message ?? "").trim();
  if (!type) return json(400, { error: "Type de message invalide." });
  if (!message) return json(400, { error: "Le message est vide." });
  if (message.length > MAX_MESSAGE_LENGTH) return json(400, { error: `Message trop long (${MAX_MESSAGE_LENGTH} caractères max).` });

  const context = (payload.context ?? "").slice(0, 500);
  const username = (user.user_metadata?.username as string | undefined) ?? "";
  const text = [
    `${TYPES[type]} envoyé depuis SideQuest`,
    "",
    message,
    "",
    "—",
    `De : ${username ? `${username} ` : ""}<${user.email ?? "adresse inconnue"}>`,
    `Utilisateur : ${user.id}`,
    context && `Contexte : ${context}`,
  ].filter(line => line !== "").join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: Deno.env.get("RESEND_FROM") ?? "SideQuest <onboarding@resend.dev>",
      to: [adminEmail],
      // Répondre au mail répond directement à l'utilisateur.
      ...(user.email && { reply_to: user.email }),
      subject: `[SideQuest] ${TYPES[type]}`,
      text,
      html: renderHtml({ type, message, username, email: user.email ?? "", userId: user.id, context }),
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Resend a refusé l'envoi :", response.status, detail);
    // La raison donnée par Resend (clé invalide, destinataire non autorisé…) aide au diagnostic ;
    // elle ne contient aucune donnée sensible.
    let reason = "";
    try { reason = (JSON.parse(detail) as { message?: string }).message ?? ""; } catch { /* réponse non JSON */ }
    return json(502, { error: `L'envoi a échoué (Resend ${response.status}${reason ? ` : ${reason}` : ""}).` });
  }
  return json(200, { ok: true });
});
