import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CadastroDto } from './dto/cadastro.dto';
import { LoginDto } from './dto/login.dto';
import { gerarToken, hashSenha, verificarSenha } from './security';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizarEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private usuarioPublico(usuario: { id: number; nome: string; email: string; perfil: string }) {
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
    };
  }

  async cadastrar(dto: CadastroDto) {
    const email = this.normalizarEmail(dto.email);
    const existente = await this.prisma.usuario.findUnique({ where: { email } });
    if (existente) throw new ConflictException('Este e-mail já está cadastrado');

    const usuario = await this.prisma.usuario.create({
      data: {
        nome: dto.nome.trim(),
        email,
        senhaHash: hashSenha(dto.senha),
        perfil: 'CLIENTE',
      },
    });

    return this.usuarioPublico(usuario);
  }

  async login(dto: LoginDto) {
    const email = this.normalizarEmail(dto.email);
    const usuario = await this.prisma.usuario.findUnique({ where: { email } });

    if (!usuario || !verificarSenha(dto.senha, usuario.senhaHash)) {
      throw new UnauthorizedException('E-mail ou senha incorretos');
    }

    const usuarioPublico = this.usuarioPublico(usuario);
    const accessToken = gerarToken({
      sub: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
    });

    return { accessToken, usuario: usuarioPublico };
  }

  async buscarPorId(id: number) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new UnauthorizedException('Usuário não encontrado');
    return this.usuarioPublico(usuario);
  }
}
