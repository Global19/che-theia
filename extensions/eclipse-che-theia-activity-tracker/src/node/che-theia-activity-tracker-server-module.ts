/**********************************************************************
 * Copyright (c) 2019-2020 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ***********************************************************************/

import { ContainerModule } from 'inversify';
import { ConnectionHandler, JsonRpcConnectionHandler } from '@theia/core/lib/common';
import { ActivityTrackerService, ACTIVITY_TRACKER_SERVICE_PATH } from '../common/activity-tracker-protocol';
import { ActivityTrackerServiceImpl } from './activity-tracker-service';

export default new ContainerModule(bind => {
    bind(ActivityTrackerService).to(ActivityTrackerServiceImpl).inSingletonScope();

    bind(ConnectionHandler).toDynamicValue(context =>
        new JsonRpcConnectionHandler(ACTIVITY_TRACKER_SERVICE_PATH, () => context.container.get(ActivityTrackerService))
    ).inSingletonScope();
});
