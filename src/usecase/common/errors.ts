import { ZodError } from "zod";
import { AppError } from "../../shared/AppError";
import { ErrorType } from "../../shared/AppError";

export class UnprocessableEntity extends AppError {
  constructor(errors?: object | ZodError) {
    super(ErrorType.ErrUnprocessableEntity, 'user record unprocessable');
    if (errors instanceof ZodError) {
      for (const err of errors.issues) {
        this.errors = [];
        this.errors.push({ message: err.message });
      }
    }
  }
}
