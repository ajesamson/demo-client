export interface KarmaEntity {
  status: string;
  message: string;
  data: KarmaData;
  meta: KarmaMeta;
  'mock-response'?: string;
}

interface KarmaData {
  karma_identity: string;
  amount_in_contention: string;
  reason: string | null;
  default_date: string;
  karma_type: KarmaType;
  karma_identity_type: KarmaIdentityType;
  reporting_entity: ReportingEntity;
}

interface KarmaType {
  karma: string;
}

interface KarmaIdentityType {
  identity_type: string;
}

interface ReportingEntity {
  name: string;
  email: string;
}

interface KarmaMeta {
  cost: number;
  balance: number;
}
