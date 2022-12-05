/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Model } from './model';
import { Task } from './task';
import { Train } from './train';
import { ModelAlgorithm } from './model_algorithm';
import { Predict } from './predict';
import { ModelGroup } from './model_group';

const apiInstanceStore: {
  model: Model | undefined;
  task: Task | undefined;
  train: Train | undefined;
  modelAlgorithm: ModelAlgorithm | undefined;
  predict: Predict | undefined;
  modelGroup: ModelGroup | undefined;
} = {
  model: undefined,
  task: undefined,
  train: undefined,
  modelAlgorithm: undefined,
  predict: undefined,
  modelGroup: undefined,
};

export class APIProvider {
  public static getAPI(type: 'task'): Task;
  public static getAPI(type: 'model'): Model;
  public static getAPI(type: 'train'): Train;
  public static getAPI(type: 'modelAlgorithm'): ModelAlgorithm;
  public static getAPI(type: 'predict'): Predict;
  public static getAPI(type: 'modelGroup'): ModelGroup;
  public static getAPI(type: keyof typeof apiInstanceStore) {
    if (apiInstanceStore[type]) {
      return apiInstanceStore[type]!;
    }
    switch (type) {
      case 'model': {
        const newInstance = new Model();
        apiInstanceStore.model = newInstance;
        return newInstance;
      }
      case 'task': {
        const newInstance = new Task();
        apiInstanceStore.task = newInstance;
        return newInstance;
      }
      case 'train': {
        const newInstance = new Train();
        apiInstanceStore.train = newInstance;
        return newInstance;
      }
      case 'modelAlgorithm': {
        const newInstance = new ModelAlgorithm();
        apiInstanceStore.modelAlgorithm = newInstance;
        return newInstance;
      }
      case 'predict': {
        const newInstance = new Predict();
        apiInstanceStore.predict = newInstance;
        return newInstance;
      }
      case 'modelGroup': {
        const newInstance = new ModelGroup();
        apiInstanceStore.modelGroup = newInstance;
        return newInstance;
      }
    }
  }
  public static clear() {
    apiInstanceStore.model = undefined;
  }
}
