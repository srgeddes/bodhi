import bcrypt from "bcryptjs";
import { BaseService } from "./base.service";
import { User } from "@/domain/entities";
import { ConflictError, UnauthorizedError } from "@/domain/errors";
import { IUserRepository } from "@/domain/interfaces/repositories";
import { signToken } from "@/lib/auth";
import { BCRYPT_ROUNDS } from "@/config/constants";
import { RegisterDto, LoginDto } from "@/dtos/auth";

interface AuthResult {
  user: User;
  token: string;
}

export class UserService extends BaseService<User> {
  protected readonly entityName = "User";

  constructor(private readonly userRepository: IUserRepository) {
    super(userRepository);
  }

  async register(dto: RegisterDto): Promise<AuthResult> {
    const exists = await this.userRepository.existsByEmail(dto.email);
    if (exists) {
      throw new ConflictError("A user with this email already exists");
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = User.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
    });

    const created = await this.repository.create(user);
    const token = signToken(created.id);

    return { user: created, token };
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const token = signToken(user.id);
    return { user, token };
  }
}
