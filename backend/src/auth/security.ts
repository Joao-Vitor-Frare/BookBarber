import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const TOKEN_TTL_SECONDS = 8 * 60 * 60;

function base64UrlJson(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function assinatura(conteudo: string) {
  const segredo = process.env.JWT_SECRET || 'bookbarber-dev-secret-change-me';
  return createHmac('sha256', segredo).update(conteudo).digest('base64url');
}

export function hashSenha(senha: string) {
  const salt = randomBytes(16).toString('hex');
  const derivada = scryptSync(senha, salt, 64).toString('hex');
  return `${salt}:${derivada}`;
}

export function verificarSenha(senha: string, armazenada: string) {
  const [salt, hashHex] = armazenada.split(':');
  if (!salt || !hashHex) return false;

  const hashEsperada = Buffer.from(hashHex, 'hex');
  const hashRecebida = scryptSync(senha, salt, 64);
  return hashEsperada.length === hashRecebida.length && timingSafeEqual(hashEsperada, hashRecebida);
}

export type TokenPayload = {
  sub: number;
  nome: string;
  email: string;
  perfil: string;
  iat: number;
  exp: number;
};

export function gerarToken(payload: Omit<TokenPayload, 'iat' | 'exp'>) {
  const agora = Math.floor(Date.now() / 1000);
  const header = base64UrlJson({ alg: 'HS256', typ: 'JWT' });
  const body = base64UrlJson({ ...payload, iat: agora, exp: agora + TOKEN_TTL_SECONDS });
  const conteudo = `${header}.${body}`;
  return `${conteudo}.${assinatura(conteudo)}`;
}

export function verificarToken(token: string): TokenPayload {
  const partes = token.split('.');
  if (partes.length !== 3) throw new Error('Token inválido');

  const [header, body, recebida] = partes;
  const conteudo = `${header}.${body}`;
  const esperada = assinatura(conteudo);
  const assinaturaRecebida = Buffer.from(recebida);
  const assinaturaEsperada = Buffer.from(esperada);

  if (
    assinaturaRecebida.length !== assinaturaEsperada.length ||
    !timingSafeEqual(assinaturaRecebida, assinaturaEsperada)
  ) {
    throw new Error('Assinatura inválida');
  }

  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as TokenPayload;
  if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) throw new Error('Token expirado');
  return payload;
}
