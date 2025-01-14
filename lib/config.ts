import { prisma } from './prisma';

export async function getConfig(key: string) {
  const config = await prisma.config.findUnique({
    where: { key },
  });

  if (!config) return null;
  switch (config.type) {
    case 'NUMBER':
      return parseFloat(config.value);
    case 'BOOLEAN':
      return config.value === 'true';
    case 'JSON':
      return JSON.parse(config.value);
    default:
      return config.value;
  }
}

export async function setConfig(key: string, value: any, type: string) {
  const stringValue = type === "JSON" ? JSON.stringify(value) : String(value);

  return prisma.config.upsert({
    where: { key },
    update: { value: stringValue },
    create: {
      key,
      value: stringValue,
      type,
    },
  });
}

export async function getAllConfig() {
  const configs = await prisma.config.findMany();
  return configs.reduce((acc, config) => {
    acc[config.key] = getConfig(config.key);
    return acc;
  }, {} as Record<string, any>);
}