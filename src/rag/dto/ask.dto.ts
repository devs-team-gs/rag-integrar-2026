import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AskDto {
  @IsString({ message: 'La pregunta tiene que ser texto.' })
  @IsNotEmpty({ message: 'La pregunta no puede estar vacía.' })
  @MaxLength(500, { message: 'La pregunta no puede pasar de 500 caracteres.' })
  pregunta: string;
}
