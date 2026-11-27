import { DraftLine, DraftQuestion } from "../../modules/materials/estimates/draft.types";
/** Чистая функция: одна строка черновика -> один вопрос либо null. */
export function lineQuestion(line: DraftLine, itemIndex: number): DraftQuestion | null {
  const title = line.serviceName ?? line.serviceQuery;

  switch (line.status) {
    case 'needs_quantity':
      return {
        code: 'missing_quantity',
        itemIndex,
        text: `Какой объём работы «${line.serviceQuery}»? Укажите число в ${line.unitCode ?? 'подходящей единице'}.`,
      };

    case 'needs_unit':
      return {
        code: 'needs_unit',
        itemIndex,
        text: `Работа «${title}» считается в ${line.unitCode}, а в тексте указано ${line.requestedUnitCode}. Подтвердите единицу или уточните объём.`,
      };

    case 'unmatched':
      return {
        code: 'unmatched',
        itemIndex,
        text: `Не нашёл в каталоге работу «${line.serviceQuery}». Выберите услугу вручную или опишите иначе.`,
      };

    case 'ambiguous':
      return {
        code: 'ambiguous',
        itemIndex,
        text: `«${line.serviceQuery}» подходит нескольким услугам. Какая нужна?`,
        candidates: line.candidates,
      };

    case 'no_price':
      return {
        code: 'no_price',
        itemIndex,
        text: `Для «${title}» нет расценки в вашем прайсе и справочнике. Укажите цену за ${line.unitCode ?? 'единицу'}.`,
      };

    case 'priced':
      return null;
  }
}
