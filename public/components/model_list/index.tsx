/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { EuiPageHeader, EuiSpacer, EuiPanel } from '@elastic/eui';
import moment from 'moment';

import { CoreStart } from '../../../../../src/core/public';
import { APIProvider } from '../../apis/api_provider';
import { useFetcher } from '../../hooks/use_fetcher';

import { ModelTable } from './model_table';
import {
  ModelConfirmDeleteModal,
  ModelConfirmDeleteModalInstance,
} from './model_confirm_delete_modal';
import { ModelDrawer } from '../model_drawer';

export const ModelList = ({ notifications }: { notifications: CoreStart['notifications'] }) => {
  const confirmModelDeleteRef = useRef<ModelConfirmDeleteModalInstance>(null);
  const [drawerModelName, setDrawerModelName] = useState('');

  const { data: modelGroupData, reload } = useFetcher(APIProvider.getAPI('modelGroup').search);

  const modelGroups = useMemo(() => modelGroupData || [], [modelGroupData]);

  const handleModelDeleted = useCallback(async () => {
    notifications.toasts.addSuccess('Model has been deleted.');
    reload();
  }, [notifications.toasts, reload]);

  const handleModelDelete = useCallback((modelIds: string[]) => {
    confirmModelDeleteRef.current?.show(modelIds);
  }, []);

  const handleViewModelDrawer = useCallback((name: string) => {
    setDrawerModelName(name);
  }, []);

  return (
    <EuiPanel>
      <EuiPageHeader
        pageTitle={
          <>
            Models
            {modelGroupData?.length && (
              <span style={{ fontSize: '0.6em', verticalAlign: 'middle', paddingLeft: 4 }}>
                ({modelGroupData.length})
              </span>
            )}
          </>
        }
        bottomBorder
      />
      <EuiSpacer />
      <EuiSpacer />
      <ModelTable
        models={modelGroups}
        onModelDelete={handleModelDelete}
        onViewModelDrawer={handleViewModelDrawer}
      />
      <ModelConfirmDeleteModal ref={confirmModelDeleteRef} onDeleted={handleModelDeleted} />
      {drawerModelName && (
        <ModelDrawer onClose={() => setDrawerModelName('')} name={drawerModelName} />
      )}
    </EuiPanel>
  );
};
