/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useCallback } from 'react';
import { generatePath, useHistory } from 'react-router-dom';
import { CustomItemAction, EuiBasicTable, EuiButtonIcon } from '@elastic/eui';

import { routerPaths } from '../../../common/router_paths';

export type ModelTableSort = 'trainTime-desc' | 'trainTime-asc';
export interface ModelTableCriteria {
  pagination: { currentPage: number; pageSize: number };
  sort?: ModelTableSort;
}

export interface ModelGroupItem {
  name: string;
  latestVersion: string;
  versionIds: string[];
}

export function ModelTable(props: {
  models: { name: string; latestVersion: string }[];
  onModelDelete: (ids: string[]) => void;
  onViewModelDrawer: (name: string) => void;
}) {
  const { models, onModelDelete, onViewModelDrawer } = props;
  const history = useHistory();

  const columns = useMemo(
    () => [
      {
        field: 'name',
        name: 'Name',
      },
      {
        field: 'latestVersion',
        name: 'Latest Version',
      },
      {
        name: 'Actions',
        actions: [
          {
            render: ({ name, versionIds }) => (
              <>
                <EuiButtonIcon
                  iconType="lensApp"
                  onClick={(e: { stopPropagation: () => void }) => {
                    e.stopPropagation();
                    onViewModelDrawer(name);
                  }}
                  data-test-subj={`model-version-button-${name}`}
                />
                <EuiButtonIcon
                  iconType="trash"
                  color="danger"
                  onClick={(e: { stopPropagation: () => void }) => {
                    e.stopPropagation();
                    onModelDelete(versionIds);
                  }}
                  data-test-subj={`model-delete-button-${versionIds.join('-')}`}
                />
              </>
            ),
          } as CustomItemAction<ModelGroupItem>,
        ],
      },
    ],
    [onModelDelete, onViewModelDrawer]
  );

  const rowProps = useCallback(
    ({ id }) => ({
      onClick: () => {
        history.push(generatePath(routerPaths.modelDetail, { id }));
      },
    }),
    [history]
  );

  return <EuiBasicTable<ModelGroupItem> columns={columns} items={models} rowProps={rowProps} />;
}
