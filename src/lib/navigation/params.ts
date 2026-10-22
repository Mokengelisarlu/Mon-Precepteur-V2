export const ENTITY_ID_PREFIXES = {
  assignment: 'asg',
  child: 'chd',
  client: 'cli',
  contract: 'ctr',
  event: 'evt',
  invoice: 'inv',
  need: 'ned',
  notification: 'ntf',
  payment: 'pay',
  proposal: 'prp',
  receipt: 'rcp',
  request: 'req',
  tutor: 'tut',
} as const;

export type EntityKind = keyof typeof ENTITY_ID_PREFIXES;

const ID_PATTERNS: Readonly<Record<EntityKind, RegExp>> = {
  assignment: /^asg_[A-Za-z0-9-]+$/,
  child: /^chd_[A-Za-z0-9-]+$/,
  client: /^cli_[A-Za-z0-9-]+$/,
  contract: /^ctr_[A-Za-z0-9-]+$/,
  event: /^evt_[A-Za-z0-9-]+$/,
  invoice: /^inv_[A-Za-z0-9-]+$/,
  need: /^ned_[A-Za-z0-9-]+$/,
  notification: /^ntf_[A-Za-z0-9-]+$/,
  payment: /^pay_[A-Za-z0-9-]+$/,
  proposal: /^prp_[A-Za-z0-9-]+$/,
  receipt: /^rcp_[A-Za-z0-9-]+$/,
  request: /^req_[A-Za-z0-9-]+$/,
  tutor: /^tut_[A-Za-z0-9-]+$/,
};

export function isEntityId(value: string, kind: EntityKind): boolean {
  return ID_PATTERNS[kind].test(value);
}

export function readParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}
