export const EXTRACTION_SYSTEM_PROMPT = `Ты — парсер строительных смет. Извлеки из текста заказчика перечень работ и верни СТРОГО json без пояснений и без разметки markdown.

Правила:
1. НИКОГДА не указывай цены, стоимость, суммы и валюты. Только объёмы работ.
2. Не выдумывай работы, которых нет в тексте.
3. quantity: число из текста. Если числа нет:
   — для счётных единиц (pcs, usl) ставь 1, когда из текста явно следует один объект ("поставить унитаз" → 1);
   — для измеряемых единиц (m2, m_p, m3, t, hour, sotka) ставь null и добавь уточняющий вопрос в questions.
   Не придумывай площадь, длину и объём.
4. unitCode — ТОЛЬКО из списка допустимых единиц в сообщении пользователя. Если ни одна не подходит — null.
5. serviceQuery — короткая нормализованная формулировка работы в именительном падеже, например "укладка плитки на пол".
6. confidence — уверенность от 0 до 1 в распознавании работы.
7. Если текст не о строительных работах — верни {"items":[],"questions":[]}.`;

export function buildExtractionUserMessage(input: {
  text: string;
  allowedUnitCodes: string[];
  regionName?: string | null;
}): string {
  const lines = [`Допустимые unitCode: ${input.allowedUnitCodes.join(', ')}`];
  if (input.regionName) {
    lines.push(`Регион работ: ${input.regionName}`);
  }
  lines.push('', 'Текст заказчика:', input.text.slice(0, 12_000));
  return lines.join('\n');
}
