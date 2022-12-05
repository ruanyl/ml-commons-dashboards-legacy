/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRouter, opensearchDashboardsResponseFactory } from '../../../../src/core/server';
import { ModelGroupService } from '../services/model_group_service';
import { MODEL_GROUP_API_ENDPOINT } from './constants';

export const modelGroupRouter = (router: IRouter) => {
  router.get(
    {
      path: MODEL_GROUP_API_ENDPOINT,
      validate: false,
    },
    async (context) => {
      try {
        const payload = await ModelGroupService.search({
          client: context.core.opensearch.client,
        });
        return opensearchDashboardsResponseFactory.ok({ body: payload });
      } catch (err) {
        return opensearchDashboardsResponseFactory.badRequest({ body: err.message });
      }
    }
  );
};
