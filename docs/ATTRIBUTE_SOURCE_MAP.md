# 능력치 원자료 매핑

> 자동 생성: `npm run base-profile:docs`
> 이 문서는 P0 81명 × 활성 모델 8개 = 648개 능력치의 현재 근거 상태를 열거합니다.

## 계산 원칙

- 공식 원자료와 앱 파생 1–20 점수는 분리합니다.
- 원자료가 없는 지표는 0으로 바꾸지 않습니다.
- 유효 지표만 원래 설정 가중치에 비례해 합계 1로 재정규화합니다.
- 비교 표본이 없거나 속성에 사용할 수 있는 지표가 하나도 없으면 결과는 null입니다.
- 현재 P0 성능 원자료가 0건이므로 아래 모든 결과는 null이며 imputed도 false입니다.

| 국가 | 선수 | 속성 | 계획 지표·가중치 | 원자료 | 출처 ID | 적용 가중치 | 결과 | confidence | imputed |
|---|---|---|---|---|---|---|---:|---:|---|
| KOR | 김승규 | shotStopping | saves; shotsOnTargetFaced; goalsConceded | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 김승규 | distribution | passCompletionRate; longPassCompletionRate; completedPassesPer90 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 김승규 | aerialCommand | crossesClaimed; aerial actions | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 김승규 | sweeping | sweeperActions; defensive actions outside box | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 김승규 | penaltySaving | penaltiesSaved; penaltiesFaced | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 김승규 | stability | cleanSheets; goalsConceded; minutesReliability | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 김승규 | buildUp | passCompletionRate; longPassCompletionRate | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 김승규 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이한범 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이한범 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이한범 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이한범 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이한범 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이한범 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이한범 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이한범 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이기혁 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이기혁 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이기혁 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이기혁 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이기혁 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이기혁 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이기혁 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이기혁 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 김민재 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 김민재 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 김민재 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 김민재 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 김민재 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 김민재 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 김민재 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 김민재 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 황인범 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 황인범 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 황인범 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 황인범 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 황인범 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 황인범 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 황인범 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 황인범 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 손흥민 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 손흥민 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 손흥민 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 손흥민 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 손흥민 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 손흥민 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 손흥민 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 손흥민 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 백승호 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 백승호 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 백승호 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 백승호 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 백승호 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 백승호 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 백승호 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 백승호 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 조규성 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 조규성 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 조규성 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 조규성 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 조규성 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 조규성 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 조규성 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 조규성 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이재성 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이재성 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이재성 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이재성 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이재성 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이재성 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이재성 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이재성 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 황희찬 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 황희찬 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 황희찬 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 황희찬 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 황희찬 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 황희찬 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 황희찬 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 황희찬 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이태석 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이태석 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이태석 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이태석 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이태석 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이태석 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이태석 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이태석 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 박진섭 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 박진섭 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 박진섭 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 박진섭 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 박진섭 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 박진섭 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 박진섭 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 박진섭 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 배준호 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 배준호 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 배준호 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 배준호 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 배준호 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 배준호 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 배준호 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 배준호 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 오현규 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 오현규 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 오현규 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 오현규 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 오현규 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 오현규 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 오현규 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 오현규 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이강인 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이강인 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이강인 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이강인 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이강인 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이강인 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이강인 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 이강인 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 양현준 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 양현준 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 양현준 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 양현준 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 양현준 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 양현준 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 양현준 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 양현준 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 설영우 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 설영우 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 설영우 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 설영우 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 설영우 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 설영우 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 설영우 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 설영우 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 옌스 카스트로프 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 옌스 카스트로프 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 옌스 카스트로프 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 옌스 카스트로프 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 옌스 카스트로프 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 옌스 카스트로프 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 옌스 카스트로프 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 옌스 카스트로프 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 김진규 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 김진규 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 김진규 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 김진규 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 김진규 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 김진규 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 김진규 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 김진규 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 엄지성 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 엄지성 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 엄지성 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 엄지성 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 엄지성 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 엄지성 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 엄지성 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| KOR | 엄지성 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 마테이 코바르 | shotStopping | saves; shotsOnTargetFaced; goalsConceded | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 마테이 코바르 | distribution | passCompletionRate; longPassCompletionRate; completedPassesPer90 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 마테이 코바르 | aerialCommand | crossesClaimed; aerial actions | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 마테이 코바르 | sweeping | sweeperActions; defensive actions outside box | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 마테이 코바르 | penaltySaving | penaltiesSaved; penaltiesFaced | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 마테이 코바르 | stability | cleanSheets; goalsConceded; minutesReliability | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 마테이 코바르 | buildUp | passCompletionRate; longPassCompletionRate | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 마테이 코바르 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 다비드 지마 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 다비드 지마 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 다비드 지마 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 다비드 지마 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 다비드 지마 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 다비드 지마 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 다비드 지마 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 다비드 지마 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 토마시 홀레시 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 토마시 홀레시 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 토마시 홀레시 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 토마시 홀레시 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 토마시 홀레시 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 토마시 홀레시 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 토마시 홀레시 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 토마시 홀레시 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 로빈 흐라나치 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 로빈 흐라나치 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 로빈 흐라나치 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 로빈 흐라나치 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 로빈 흐라나치 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 로빈 흐라나치 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 로빈 흐라나치 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 로빈 흐라나치 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 블라디미르 초우팔 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 블라디미르 초우팔 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 블라디미르 초우팔 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 블라디미르 초우팔 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 블라디미르 초우팔 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 블라디미르 초우팔 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 블라디미르 초우팔 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 블라디미르 초우팔 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 슈테판 할루페크 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 슈테판 할루페크 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 슈테판 할루페크 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 슈테판 할루페크 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 슈테판 할루페크 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 슈테판 할루페크 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 슈테판 할루페크 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 슈테판 할루페크 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 라디슬라프 크레이치 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 라디슬라프 크레이치 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 라디슬라프 크레이치 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 라디슬라프 크레이치 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 라디슬라프 크레이치 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 라디슬라프 크레이치 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 라디슬라프 크레이치 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 라디슬라프 크레이치 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 블라디미르 다리다 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 블라디미르 다리다 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 블라디미르 다리다 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 블라디미르 다리다 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 블라디미르 다리다 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 블라디미르 다리다 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 블라디미르 다리다 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 블라디미르 다리다 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 아담 흘로제크 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 아담 흘로제크 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 아담 흘로제크 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 아담 흘로제크 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 아담 흘로제크 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 아담 흘로제크 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 아담 흘로제크 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 아담 흘로제크 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 파트리크 시크 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 파트리크 시크 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 파트리크 시크 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 파트리크 시크 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 파트리크 시크 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 파트리크 시크 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 파트리크 시크 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 파트리크 시크 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 얀 쿠흐타 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 얀 쿠흐타 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 얀 쿠흐타 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 얀 쿠흐타 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 얀 쿠흐타 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 얀 쿠흐타 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 얀 쿠흐타 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 얀 쿠흐타 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 루카시 체르프 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 루카시 체르프 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 루카시 체르프 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 루카시 체르프 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 루카시 체르프 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 루카시 체르프 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 루카시 체르프 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 루카시 체르프 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 모이미르 히틸 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 모이미르 히틸 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 모이미르 히틸 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 모이미르 히틸 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 모이미르 히틸 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 모이미르 히틸 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 모이미르 히틸 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 모이미르 히틸 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 파벨 슐츠 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 파벨 슐츠 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 파벨 슐츠 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 파벨 슐츠 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 파벨 슐츠 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 파벨 슐츠 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 파벨 슐츠 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 파벨 슐츠 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 루카시 프로보드 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 루카시 프로보드 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 루카시 프로보드 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 루카시 프로보드 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 루카시 프로보드 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 루카시 프로보드 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 루카시 프로보드 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 루카시 프로보드 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 미할 사딜레크 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 미할 사딜레크 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 미할 사딜레크 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 미할 사딜레크 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 미할 사딜레크 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 미할 사딜레크 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 미할 사딜레크 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 미할 사딜레크 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 토마시 호리 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 토마시 호리 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 토마시 호리 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 토마시 호리 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 토마시 호리 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 토마시 호리 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 토마시 호리 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 토마시 호리 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 야로슬라프 젤레니 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 야로슬라프 젤레니 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 야로슬라프 젤레니 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 야로슬라프 젤레니 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 야로슬라프 젤레니 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 야로슬라프 젤레니 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 야로슬라프 젤레니 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 야로슬라프 젤레니 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 다비드 도우데라 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 다비드 도우데라 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 다비드 도우데라 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 다비드 도우데라 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 다비드 도우데라 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 다비드 도우데라 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 다비드 도우데라 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 다비드 도우데라 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 토마시 소우체크 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 토마시 소우체크 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 토마시 소우체크 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 토마시 소우체크 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 토마시 소우체크 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 토마시 소우체크 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 토마시 소우체크 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 토마시 소우체크 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 알렉산드르 소이카 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 알렉산드르 소이카 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 알렉산드르 소이카 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 알렉산드르 소이카 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 알렉산드르 소이카 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 알렉산드르 소이카 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 알렉산드르 소이카 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 알렉산드르 소이카 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 데니스 비신스키 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 데니스 비신스키 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 데니스 비신스키 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 데니스 비신스키 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 데니스 비신스키 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 데니스 비신스키 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 데니스 비신스키 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| CZE | 데니스 비신스키 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 라울 랑헬 | shotStopping | saves; shotsOnTargetFaced; goalsConceded | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 라울 랑헬 | distribution | passCompletionRate; longPassCompletionRate; completedPassesPer90 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 라울 랑헬 | aerialCommand | crossesClaimed; aerial actions | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 라울 랑헬 | sweeping | sweeperActions; defensive actions outside box | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 라울 랑헬 | penaltySaving | penaltiesSaved; penaltiesFaced | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 라울 랑헬 | stability | cleanSheets; goalsConceded; minutesReliability | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 라울 랑헬 | buildUp | passCompletionRate; longPassCompletionRate | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 라울 랑헬 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 호르헤 산체스 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 호르헤 산체스 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 호르헤 산체스 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 호르헤 산체스 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 호르헤 산체스 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 호르헤 산체스 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 호르헤 산체스 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 호르헤 산체스 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 세사르 몬테스 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 세사르 몬테스 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 세사르 몬테스 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 세사르 몬테스 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 세사르 몬테스 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 세사르 몬테스 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 세사르 몬테스 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 세사르 몬테스 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 에드손 알바레스 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 에드손 알바레스 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 에드손 알바레스 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 에드손 알바레스 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 에드손 알바레스 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 에드손 알바레스 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 에드손 알바레스 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 에드손 알바레스 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 요한 바스케스 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 요한 바스케스 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 요한 바스케스 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 요한 바스케스 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 요한 바스케스 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 요한 바스케스 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 요한 바스케스 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 요한 바스케스 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 에리크 리라 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 에리크 리라 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 에리크 리라 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 에리크 리라 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 에리크 리라 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 에리크 리라 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 에리크 리라 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 에리크 리라 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 알바로 피달고 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 알바로 피달고 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 알바로 피달고 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 알바로 피달고 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 알바로 피달고 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 알바로 피달고 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 알바로 피달고 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 알바로 피달고 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 라울 히메네스 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 라울 히메네스 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 라울 히메네스 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 라울 히메네스 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 라울 히메네스 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 라울 히메네스 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 라울 히메네스 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 라울 히메네스 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 알렉시스 베가 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 알렉시스 베가 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 알렉시스 베가 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 알렉시스 베가 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 알렉시스 베가 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 알렉시스 베가 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 알렉시스 베가 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 알렉시스 베가 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 산티아고 히메네스 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 산티아고 히메네스 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 산티아고 히메네스 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 산티아고 히메네스 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 산티아고 히메네스 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 산티아고 히메네스 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 산티아고 히메네스 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 산티아고 히메네스 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 아르만도 곤살레스 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 아르만도 곤살레스 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 아르만도 곤살레스 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 아르만도 곤살레스 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 아르만도 곤살레스 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 아르만도 곤살레스 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 아르만도 곤살레스 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 아르만도 곤살레스 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 이스라엘 레예스 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 이스라엘 레예스 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 이스라엘 레예스 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 이스라엘 레예스 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 이스라엘 레예스 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 이스라엘 레예스 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 이스라엘 레예스 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 이스라엘 레예스 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 훌리안 키뇨네스 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 훌리안 키뇨네스 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 훌리안 키뇨네스 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 훌리안 키뇨네스 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 훌리안 키뇨네스 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 훌리안 키뇨네스 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 훌리안 키뇨네스 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 훌리안 키뇨네스 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 오르벨린 피네다 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 오르벨린 피네다 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 오르벨린 피네다 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 오르벨린 피네다 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 오르벨린 피네다 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 오르벨린 피네다 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 오르벨린 피네다 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 오르벨린 피네다 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 오베드 바르가스 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 오베드 바르가스 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 오베드 바르가스 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 오베드 바르가스 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 오베드 바르가스 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 오베드 바르가스 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 오베드 바르가스 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 오베드 바르가스 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 힐베르토 모라 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 힐베르토 모라 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 힐베르토 모라 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 힐베르토 모라 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 힐베르토 모라 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 힐베르토 모라 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 힐베르토 모라 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 힐베르토 모라 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 마테오 차베스 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 마테오 차베스 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 마테오 차베스 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 마테오 차베스 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 마테오 차베스 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 마테오 차베스 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 마테오 차베스 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 마테오 차베스 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 세사르 우에르타 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 세사르 우에르타 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 세사르 우에르타 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 세사르 우에르타 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 세사르 우에르타 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 세사르 우에르타 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 세사르 우에르타 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 세사르 우에르타 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 헤수스 가야르도 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 헤수스 가야르도 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 헤수스 가야르도 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 헤수스 가야르도 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 헤수스 가야르도 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 헤수스 가야르도 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 헤수스 가야르도 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 헤수스 가야르도 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 루이스 차베스 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 루이스 차베스 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 루이스 차베스 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 루이스 차베스 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 루이스 차베스 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 루이스 차베스 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 루이스 차베스 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 루이스 차베스 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 로베르토 알바라도 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 로베르토 알바라도 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 로베르토 알바라도 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 로베르토 알바라도 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 로베르토 알바라도 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 로베르토 알바라도 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 로베르토 알바라도 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| MEX | 로베르토 알바라도 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 론웬 윌리엄스 | shotStopping | saves; shotsOnTargetFaced; goalsConceded | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 론웬 윌리엄스 | distribution | passCompletionRate; longPassCompletionRate; completedPassesPer90 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 론웬 윌리엄스 | aerialCommand | crossesClaimed; aerial actions | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 론웬 윌리엄스 | sweeping | sweeperActions; defensive actions outside box | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 론웬 윌리엄스 | penaltySaving | penaltiesSaved; penaltiesFaced | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 론웬 윌리엄스 | stability | cleanSheets; goalsConceded; minutesReliability | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 론웬 윌리엄스 | buildUp | passCompletionRate; longPassCompletionRate | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 론웬 윌리엄스 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 테보호 모코에나 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 테보호 모코에나 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 테보호 모코에나 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 테보호 모코에나 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 테보호 모코에나 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 테보호 모코에나 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 테보호 모코에나 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 테보호 모코에나 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 탈렌테 음바타 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 탈렌테 음바타 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 탈렌테 음바타 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 탈렌테 음바타 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 탈렌테 음바타 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 탈렌테 음바타 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 탈렌테 음바타 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 탈렌테 음바타 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 오브리 모디바 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 오브리 모디바 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 오브리 모디바 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 오브리 모디바 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 오브리 모디바 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 오브리 모디바 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 오브리 모디바 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 오브리 모디바 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 오스윈 아폴리스 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 오스윈 아폴리스 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 오스윈 아폴리스 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 오스윈 아폴리스 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 오스윈 아폴리스 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 오스윈 아폴리스 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 오스윈 아폴리스 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 오스윈 아폴리스 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 체팡 모레미 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 체팡 모레미 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 체팡 모레미 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 체팡 모레미 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 체팡 모레미 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 체팡 모레미 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 체팡 모레미 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 체팡 모레미 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 라일 포스터 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 라일 포스터 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 라일 포스터 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 라일 포스터 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 라일 포스터 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 라일 포스터 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 라일 포스터 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 라일 포스터 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 레보힐레 모포켕 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 레보힐레 모포켕 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 레보힐레 모포켕 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 레보힐레 모포켕 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 레보힐레 모포켕 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 레보힐레 모포켕 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 레보힐레 모포켕 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 레보힐레 모포켕 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 타펠로 마세코 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 타펠로 마세코 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 타펠로 마세코 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 타펠로 마세코 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 타펠로 마세코 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 타펠로 마세코 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 타펠로 마세코 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 타펠로 마세코 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 스페펠렐로 시톨레 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 스페펠렐로 시톨레 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 스페펠렐로 시톨레 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 스페펠렐로 시톨레 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 스페펠렐로 시톨레 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 스페펠렐로 시톨레 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 스페펠렐로 시톨레 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 스페펠렐로 시톨레 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 음베케젤리 음보카지 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 음베케젤리 음보카지 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 음베케젤리 음보카지 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 음베케젤리 음보카지 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 음베케젤리 음보카지 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 음베케젤리 음보카지 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 음베케젤리 음보카지 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 음베케젤리 음보카지 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 이크람 레이너스 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 이크람 레이너스 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 이크람 레이너스 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 이크람 레이너스 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 이크람 레이너스 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 이크람 레이너스 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 이크람 레이너스 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 이크람 레이너스 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 에비던스 마크고파 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 에비던스 마크고파 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 에비던스 마크고파 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 에비던스 마크고파 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 에비던스 마크고파 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 에비던스 마크고파 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 에비던스 마크고파 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 에비던스 마크고파 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 은코시나티 시비시 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 은코시나티 시비시 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 은코시나티 시비시 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 은코시나티 시비시 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 은코시나티 시비시 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 은코시나티 시비시 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 은코시나티 시비시 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 은코시나티 시비시 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 쿨리소 무다우 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 쿨리소 무다우 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 쿨리소 무다우 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 쿨리소 무다우 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 쿨리소 무다우 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 쿨리소 무다우 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 쿨리소 무다우 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 쿨리소 무다우 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 이메 오콘 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 이메 오콘 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 이메 오콘 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 이메 오콘 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 이메 오콘 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 이메 오콘 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 이메 오콘 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 이메 오콘 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 제이든 애덤스 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 제이든 애덤스 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 제이든 애덤스 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 제이든 애덤스 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 제이든 애덤스 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 제이든 애덤스 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 제이든 애덤스 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 제이든 애덤스 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 카모겔로 세벨레벨레 | finishing | nonPenaltyGoalsPer90 .40; shotsOnTargetPer90 .25; shotConversion .20; goalsPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 카모겔로 세벨레벨레 | chanceCreation | assistsPer90 .20; keyPassesPer90 .35; chancesCreatedPer90 .30; finalThirdPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 카모겔로 세벨레벨레 | dribbling | successfulDribblesPer90 .50; dribbleSuccessRate .30; progressiveCarriesPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 카모겔로 세벨레벨레 | passing | passCompletionRate .35; progressivePassesPer90 .30; finalThirdPassesPer90 .20; keyPassesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 카모겔로 세벨레벨레 | pressing | tacklesPer90 .25; interceptionsPer90 .25; recoveriesPer90 .30; pressuresPer90 .20 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 카모겔로 세벨레벨레 | defending | tacklesPer90 .25; interceptionsPer90 .25; clearancesPer90 .20; blocksPer90 .15; recoveriesPer90 .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 카모겔로 세벨레벨레 | aerial | aerialDuelsWonPer90 .60; aerialWinRate .40 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
| RSA | 카모겔로 세벨레벨레 | impact | goalsAndAssistsPer90 .35; substituteContributionPer90 .25; roleRelevantContributionPer90 .25; minutesReliability .15 | 없음 | — | 사용 가능 지표끼리 재정규화 | null | 0% | false |
