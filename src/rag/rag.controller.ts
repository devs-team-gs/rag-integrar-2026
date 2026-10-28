import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AskDto } from './dto/ask.dto';
import { RagService, RespuestaRag } from './rag.service';

@Controller('ask')
export class RagController {
  constructor(private readonly rag: RagService) {}

  /**
   * POST /ask  { "pregunta": "..." }
   *
   * Devuelve la respuesta Y los chunks que la generaron. Lo segundo no es un
   * extra: es la única forma de saber si falló el que busca o el que redacta.
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  preguntar(@Body() dto: AskDto): Promise<RespuestaRag> {
    return this.rag.preguntar(dto.pregunta);
  }
}
