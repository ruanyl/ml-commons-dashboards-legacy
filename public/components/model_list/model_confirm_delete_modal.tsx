/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useImperativeHandle, useRef, useState } from 'react';
import { EuiConfirmModal } from '@elastic/eui';
import { APIProvider } from '../../apis/api_provider';
import { usePollingUntil } from '../../hooks/use_polling_until';

export class NoIdProvideError {}

export interface ModelConfirmDeleteModalInstance {
  show: (modelId: string | string[]) => void;
}

export const ModelConfirmDeleteModal = React.forwardRef<
  ModelConfirmDeleteModalInstance,
  { onDeleted: () => void }
>(({ onDeleted }, ref) => {
  const deleteIdRef = useRef<string | string[]>();
  const [visible, setVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { start: startPolling } = usePollingUntil({
    continueChecker: async () => {
      if (!deleteIdRef.current) {
        throw new NoIdProvideError();
      }
      const ids =
        typeof deleteIdRef.current === 'string' ? [deleteIdRef.current] : deleteIdRef.current;
      const deleteCounts = ids.length;
      return (
        (
          await APIProvider.getAPI('model').search({
            ids,
            pageSize: deleteCounts,
            currentPage: 1,
          })
        ).pagination.totalRecords === deleteCounts
      );
    },
    onGiveUp: () => {
      setIsDeleting(false);
      setVisible(false);
      onDeleted();
    },
    onMaxRetries: () => {
      setIsDeleting(false);
      setVisible(false);
    },
  });

  const handleConfirm = useCallback(
    async (e) => {
      if (!deleteIdRef.current) {
        throw new NoIdProvideError();
      }
      e.stopPropagation();
      setIsDeleting(true);
      const ids =
        typeof deleteIdRef.current === 'string' ? [deleteIdRef.current] : deleteIdRef.current;
      for (let i = 0; i < ids.length; i++) {
        await APIProvider.getAPI('model').delete(ids[i]);
      }
      startPolling();
    },
    [startPolling]
  );

  const handleCancel = useCallback(() => {
    setVisible(false);
    deleteIdRef.current = undefined;
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      show: (id: string | string[]) => {
        deleteIdRef.current = id;
        setVisible(true);
      },
    }),
    []
  );

  if (!visible) {
    return null;
  }

  return (
    <EuiConfirmModal
      title="Are you sure delete this model?"
      cancelButtonText="Cancel"
      confirmButtonText="Confirm"
      onCancel={handleCancel}
      onConfirm={handleConfirm}
      isLoading={isDeleting}
    />
  );
});
