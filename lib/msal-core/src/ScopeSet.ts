/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ClientConfigurationError } from "./error/ClientConfigurationError";
import { Constants } from "./utils/Constants";

export class ScopeSet {

    /**
     * Check if there are dup scopes in a given request
     *
     * @param cachedScopes
     * @param scopes
     */
    // TODO: Rename this, intersecting scopes isn't a great name for duplicate checker
    static isIntersectingScopes(cachedScopes: Array<string>, scopes: Array<string>): boolean {
        const convertedCachedScopes = this.trimAndConvertArrayToLowerCase([...cachedScopes]);
        const requestScopes = this.trimAndConvertArrayToLowerCase([...scopes]);
        for (let i = 0; i < requestScopes.length; i++) {
            if (convertedCachedScopes.indexOf(requestScopes[i].toLowerCase()) > -1) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if a given scope is present in the request
     *
     * @param cachedScopes
     * @param scopes
     */
    static containsScope(cachedScopes: Array<string>, scopes: Array<string>): boolean {
        const convertedCachedScopes = this.trimAndConvertArrayToLowerCase([...cachedScopes]);
        const requestScopes = this.trimAndConvertArrayToLowerCase([...scopes]);
        return requestScopes.every((value: any): boolean => convertedCachedScopes.indexOf(value.toString().toLowerCase()) >= 0);
    }

    /**
     *  Trims and converts string to lower case
     *
     * @param scopes
     */
    // TODO: Rename this, too generic name for a function that only deals with scopes
    static trimAndConvertToLowerCase(scope: string): string {
        return scope.trim().toLowerCase();
    }

    /**
     * Performs trimAndConvertToLowerCase on string array
     * @param scopes 
     */
    static trimAndConvertArrayToLowerCase(scopes: Array<string>): Array<string> {
        return scopes.map(scope => this.trimAndConvertToLowerCase(scope));
    }

    /**
     * Trims each scope in scopes array
     * @param scopes 
     */
    static trimScopes(scopes: Array<string>): Array<string> {
        return scopes.map(scope => scope.trim());
    }

    /**
     * Remove one element from a scope array
     *
     * @param scopes
     * @param scope
     */
    // TODO: Rename this, too generic name for a function that only deals with scopes
    static removeElement(scopes: Array<string>, scope: string): Array<string> {
        const scopeVal = this.trimAndConvertToLowerCase(scope);
        return scopes.filter(value => value !== scopeVal);
    }

    /**
     * Parse the scopes into a formatted scopeList
     * @param scopes
     */
    static parseScope(scopes: Array<string>): string {
        let scopeList: string = "";
        if (scopes) {
            for (let i: number = 0; i < scopes.length; ++i) {
                scopeList += (i !== scopes.length - 1) ? scopes[i] + " " : scopes[i];
            }
        }

        return scopeList;
    }

    /**
     * @hidden
     *
     * Used to validate the scopes input parameter requested  by the developer.
     * @param {Array<string>} scopes - Developer requested permissions. Not all scopes are guaranteed to be included in the access token returned.
     * @param {boolean} scopesRequired - Boolean indicating whether the scopes array is required or not
     * @ignore
     */
    static validateInputScope(scopes: Array<string>, scopesRequired: boolean, clientId: string): void {
        if (!scopes) {
            if (scopesRequired) {
                throw ClientConfigurationError.createScopesRequiredError(scopes);
            } else {
                return;
            }
        }

        // Check that scopes is an array object (also throws error if scopes == null)
        if (!Array.isArray(scopes)) {
            throw ClientConfigurationError.createScopesNonArrayError(scopes);
        }

        // Check that scopes is not an empty array
        if (scopes.length < 1) {
            throw ClientConfigurationError.createEmptyScopesArrayError(scopes.toString());
        }

        // Check that clientId is passed as single scope
        if (scopes.indexOf(clientId) > -1) {
            if (scopes.length > 1) {
                throw ClientConfigurationError.createClientIdSingleScopeError(scopes.toString());
            }
        }
    }

    /**
     * @hidden
     *
     * Extracts scope value from the state sent with the authentication request.
     * @param {string} state
     * @returns {string} scope.
     * @ignore
     */
    static getScopeFromState(state: string): string {
        if (state) {
            const splitIndex = state.indexOf(Constants.resourceDelimiter);
            if (splitIndex > -1 && splitIndex + 1 < state.length) {
                return state.substring(splitIndex + 1);
            }
        }
        return "";
    }

    /**
     * @ignore
     * Appends extraScopesToConsent if passed
     * @param {@link AuthenticationParameters}
     */
    static appendScopes(reqScopes: Array<string>, reqExtraScopesToConsent: Array<string>): Array<string> {
        if (reqScopes) {
            const convertedExtraScopes = reqExtraScopesToConsent ? this.trimAndConvertArrayToLowerCase([...reqExtraScopesToConsent]) : null;
            const convertedReqScopes = this.trimAndConvertArrayToLowerCase([...reqScopes]);
            return convertedExtraScopes ? [...convertedReqScopes, ...convertedExtraScopes] : convertedReqScopes;
        }
        return null;
    }

    // #endregion

}
