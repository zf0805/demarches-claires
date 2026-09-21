declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    OPENAI_API_KEY?: string;
    OPENAI_MODEL?: string;
    PAYPAL_CLIENT_ID?: string;
    PAYPAL_CLIENT_SECRET?: string;
    PAYPAL_WEBHOOK_ID?: string;
    PAYPAL_MODE?: string;
    PAYPAL_PREMIUM_PLAN_ID?: string;
    APP_URL?: string;
    RESEND_API_KEY?: string;
    EMAIL_FROM?: string;
    CRON_SECRET?: string;
    CONVERSATION_RETENTION_DAYS?: string;
    PRICE_DOSSIER_CENTS?: string;
    PRICE_PREMIUM_CENTS?: string;
  }
}
