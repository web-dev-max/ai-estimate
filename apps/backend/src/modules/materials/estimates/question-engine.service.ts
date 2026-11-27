import { Injectable } from '@nestjs/common';

import type { DraftLine, DraftQuestion } from './draft.types';
import { MAX_QUESTIONS } from '../../../common/constant';
import { lineQuestion } from '../../../common/utils/estimatesLineQuestion';

@Injectable()
export class QuestionEngineService {
  build(lines: DraftLine[], modelQuestions: string[] = []): DraftQuestion[] {
    const fromLines = lines.flatMap((line, index) => {
      const question = lineQuestion(line, index);
      return question ? [question] : [];
    });

    const fromModel: DraftQuestion[] = modelQuestions.map((text) => ({
      code: 'model',
      itemIndex: null,
      text,
    }));

    const byKey = new Map<string, DraftQuestion>();
    for (const question of [...fromLines, ...fromModel]) {
      const key = `${question.code}:${question.itemIndex}:${question.text}`;
      if (!byKey.has(key)) byKey.set(key, question);
    }

    return [...byKey.values()].slice(0, MAX_QUESTIONS);
  }
}
