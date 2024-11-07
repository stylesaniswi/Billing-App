import { prisma } from './prisma';
import { ConfigType } from '@prisma/client';

export async function getConfig(key: string) {
  const config = await prisma.config.findUnique({
    where: { key },
  });

  if (!config) return null;

  switch (config.type) {
    case ConfigType.NUMBER:
      return parseFloat(config.value);
    case ConfigType.BOOLEAN:
      return config.value === 'true';
    case ConfigType.JSON:
      return JSON.parse(config.value);
    default:
      return config.value;
  }
}

export async function setConfig(key: string, value: any, type: ConfigType) {
  const stringValue = type === ConfigType.JSON ? JSON.stringify(value) : String(value);

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