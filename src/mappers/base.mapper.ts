export abstract class BaseMapper<Entity, ResponseDto> {
  abstract toDto(entity: Entity): ResponseDto;
  abstract toDomain(raw: Record<string, unknown>): Entity;
  abstract toPersistence(entity: Entity): Record<string, unknown>;

  toDtoList(entities: Entity[]): ResponseDto[] {
    return entities.map((e) => this.toDto(e));
  }
}
