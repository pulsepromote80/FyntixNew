export type TicketStatus = "open" | "closed";

export interface TicketRecord {
  TicketId: string;
  UserID?: string;
  UserName?: string;
  Subject?: string;
  TicketType?: string;
  Status?: number | string;
  StatusType?: string;
  CreatedDate?: string;
  ImagePath?: string;
}

export interface TicketReply {
  id?: string | number;
  Message?: string;
  ReplyDate?: string;
  Name?: string;
  Status?: number | string;
  ImagePath?: string;
}

export interface TicketDetails {
  ticket: TicketRecord[];
  replies: TicketReply[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getValue(value: Record<string, unknown>, ...keys: string[]): unknown {
  const normalizedKeys = new Set(keys.map((key) => key.toLowerCase()));
  const matchingKey = Object.keys(value).find((key) => normalizedKeys.has(key.toLowerCase()));
  return matchingKey === undefined ? undefined : value[matchingKey];
}

function readText(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return undefined;
}

function readTicket(value: unknown): TicketRecord | null {
  if (!isRecord(value)) return null;
  const ticketId = readText(getValue(value, "TicketId"));
  if (!ticketId) return null;
  const status = getValue(value, "Status");

  return {
    TicketId: ticketId,
    UserID: readText(getValue(value, "UserID")),
    UserName: readText(getValue(value, "UserName")),
    Subject: readText(getValue(value, "Subject")),
    TicketType: readText(getValue(value, "TicketType")),
    Status: typeof status === "number" || typeof status === "string" ? status : undefined,
    StatusType: readText(getValue(value, "StatusType")),
    CreatedDate: readText(getValue(value, "CreatedDate")),
    ImagePath: readText(getValue(value, "ImagePath")),
  };
}

function readReplies(value: unknown): TicketReply[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord).map((reply) => {
    const id = getValue(reply, "id");
    const status = getValue(reply, "Status");
    return {
      id: typeof id === "string" || typeof id === "number" ? id : undefined,
      Message: readText(getValue(reply, "Message", "Messages")),
      ReplyDate: readText(getValue(reply, "ReplyDate", "timestamp")),
      Name: readText(getValue(reply, "Name")),
      Status: typeof status === "number" || typeof status === "string" ? status : undefined,
      ImagePath: readText(getValue(reply, "ImagePath")),
    };
  });
}

export function normalizeTicketList(payload: unknown): TicketRecord[] {
  if (Array.isArray(payload)) {
    return payload.map(readTicket).filter((ticket): ticket is TicketRecord => ticket !== null);
  }
  if (!isRecord(payload)) return [];

  for (const key of ["tickets", "data", "ticket", "result"]) {
    const candidate = payload[key];
    if (Array.isArray(candidate)) return normalizeTicketList(candidate);
    if (isRecord(candidate)) {
      const nested = normalizeTicketList(candidate);
      if (nested.length > 0) return nested;
    }
  }
  return [];
}

export function normalizeTicketDetails(payload: unknown): TicketDetails {
  let current: unknown = payload;
  for (let depth = 0; depth < 5; depth += 1) {
    if (!isRecord(current)) break;

    const repliesValue = getValue(current, "replies", "ticketReplies", "replyList");
    const ticketValue = getValue(current, "ticket", "tickets");
    if (Array.isArray(repliesValue) || ticketValue !== undefined) {
      const ticketCandidates = Array.isArray(ticketValue)
        ? ticketValue
        : ticketValue === undefined
          ? []
          : [ticketValue];
      return {
        ticket: ticketCandidates
          .map(readTicket)
          .filter((ticket): ticket is TicketRecord => ticket !== null),
        replies: readReplies(repliesValue),
      };
    }

    current = getValue(current, "data", "result", "ticketDetails");
  }

  return { ticket: [], replies: [] };
}

export function isOpenTicket(ticket: TicketRecord): boolean {
  return ticket.Status === 1 || ticket.Status === "1";
}

export function isClosedTicket(ticket: TicketRecord): boolean {
  return !isOpenTicket(ticket);
}
