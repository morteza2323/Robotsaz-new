import "server-only";

function requiredEnvironmentVariable(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

export function getSiteConfig() {
  return {
    contactEmail: requiredEnvironmentVariable("CONTACT_EMAIL"),
    contactPhone: requiredEnvironmentVariable("CONTACT_PHONE"),
    contactPhoneHref: requiredEnvironmentVariable("CONTACT_PHONE_HREF"),
    companyAddress: requiredEnvironmentVariable("COMPANY_ADDRESS"),
    businessHours: requiredEnvironmentVariable("BUSINESS_HOURS"),
    mapEmbedUrl: requiredEnvironmentVariable("MAP_EMBED_URL"),
  };
}
