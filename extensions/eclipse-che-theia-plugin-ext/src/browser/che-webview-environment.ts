
/********************************************************************************
 * Copyright (C) 2019 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import { injectable, inject, postConstruct } from 'inversify';
import { CheApiService } from '../common/che-protocol';
import { EnvVariablesServer } from '@theia/core/lib/common/env-variables';
import { WebviewEnvironment } from '@theia/plugin-ext/lib/main/browser/webview/webview-environment';
import { WebviewExternalEndpoint } from '@theia/plugin-ext/lib/main/common/webview-protocol';
import { che as cheApi } from '@eclipse-che/api';

@injectable()
export class CheWebviewEnvironment extends WebviewEnvironment {

    @inject(EnvVariablesServer)
    protected readonly environments: EnvVariablesServer;

    @inject(CheApiService)
    private cheApi: CheApiService;

    @postConstruct()
    protected async init(): Promise<void> {
        try {
            const variable = await this.environments.getValue(WebviewExternalEndpoint.pattern);
            const constainers = await this.cheApi.getCurrentWorkspacesContainers();
            const ideServer = this.findIdeServer(constainers);
            let domain;
            if (ideServer && ideServer.url) {
                domain = this.getUrlDomain(ideServer.url);
            }
            const value = variable && variable.value || domain || WebviewExternalEndpoint.pattern;
            this.externalEndpointHost.resolve(value.replace('{{hostname}}', window.location.host || 'localhost'));
        } catch (e) {
            this.externalEndpointHost.reject(e);
        }
    }

    private findIdeServer(containers: { [key: string]: cheApi.workspace.Machine }): cheApi.workspace.Server | undefined {
        try {
            if (containers) {
                for (const containerName in containers) {
                    const servers = containers[containerName].servers;
                    if (servers) {
                        for (const serverName in servers) {
                            const server = servers[serverName];
                            if (server && server.attributes && server.attributes['type'] === 'ide') {
                                return server;
                            }
                        }
                    }
                }
            }
        } catch (e) {
            throw new Error(`Unable to get workspace servers. Cause: ${e}`);
        }
        return undefined;
    }

    private getUrlDomain(routeUrl: string): string {
        // Remove trailing slash if any
        if (routeUrl.endsWith('/')) {
            routeUrl = routeUrl.substring(0, routeUrl.length - 1);
        }
        // Remove protocol
        const webviewDomain = routeUrl.replace(/^https?:\/\//, '');

        return webviewDomain;
    }
}