import { Pieces } from "../../../shared/contants"

export type ActiveMatchRequest = {
  id: number,
  piece: Pieces,
  block: string
}
