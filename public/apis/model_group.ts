/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MODEL_GROUP_API_ENDPOINT } from '../../server/routes/constants';
import { InnerHttpProvider } from './inner_http_provider';

export class ModelGroup {
  public search() {
    return InnerHttpProvider.getHttp().get<
      {
        name: string;
        latestVersion: string;
        stages: { deployed: string[]; undeployed: string[] };
        versionIds: string[];
      }[]
    >(MODEL_GROUP_API_ENDPOINT);
  }
}
