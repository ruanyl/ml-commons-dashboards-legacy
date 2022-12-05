/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

import { IScopedClusterClient } from '../../../../src/core/server';
import { MODEL_SEARCH_API } from './utils/constants';

export class ModelGroupService {
  public static async search({ client }: { client: IScopedClusterClient }) {
    const result = await client.asCurrentUser.transport.request({
      method: 'GET',
      path: MODEL_SEARCH_API,
      body: {
        size: 0,
        query: {
          bool: {
            must: [],
            must_not: {
              exists: {
                field: 'chunk_number',
              },
            },
          },
        },
        aggregations: {
          modelGroups: {
            scripted_metric: {
              init_script: 'state.responses = new HashMap()',
              map_script: `
                  def name = doc['name.keyword'].value;
                  def version = doc['model_version'].value;
                  def versionId = doc['_id'].value;
                  def createdTime = 0;
                  def isDeployed = doc['model_state'].value == 'LOADED';

                  if (doc['created_time'].length > 0) {
                    createdTime = doc['created_time'].value.toEpochSecond();
                  }

                  if(!state.responses.containsKey(name)){
                    def modelGroup = new HashMap();
                    def stageMap = new HashMap();
                    stageMap.put('deployed', new ArrayList());
                    stageMap.put('undeployed', new ArrayList());
                    modelGroup.put('name', name);
                    modelGroup.put('stages', stageMap);
                    modelGroup.put('latestCreatedTime', createdTime);
                    modelGroup.put('latestVersion', version);
                    modelGroup.put('versionIds', new ArrayList());
                    state.responses.put(name, modelGroup);
                  }

                  def modelGroup = state.responses.get(name);

                  modelGroup.get("versionIds").add(versionId);
                  if(modelGroup.get('latestCreatedTime') < createdTime){
                    modelGroup.put('latestCreatedTime', createdTime);
                    modelGroup.put('latestVersion', version);
                  }
                  if (isDeployed) {
                    modelGroup.get('stages').get('deployed').add(version);
                  } else {
                    modelGroup.get('stages').get('undeployed').add(version);
                  }
                   `,
              combine_script: 'state.responses',
              reduce_script: `
                  def result = new ArrayList();
                  for (responses in states) {
                    for(mdoelGroup in responses.values()){
                      result.add(mdoelGroup);
                    }
                  }
                  return result;
              `,
            },
          },
        },
      },
    });
    return result.body.aggregations.modelGroups.value;
  }
}
