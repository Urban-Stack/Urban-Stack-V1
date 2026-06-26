<#import "template.ftl" as layout>
<div class="flex-wrapper">
    <div class="login-panel">
        <@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password') displayInfo=realm.password && realm.registrationAllowed && !registrationDisabled??; section>
            <#if section = "header">
                👋 ${msg("loginAccountTitle")}
            <#elseif section = "form">
                <div id="kc-form">
                    <div id="kc-form-wrapper">
                        <#if realm.password>
                            <form id="kc-form-login" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">
                                <#if !usernameHidden??>
                                    <div class="${properties.kcFormGroupClass!}">
                                        <label for="username"
                                               class="${properties.kcLabelClass!}"><#if !realm.loginWithEmailAllowed>${msg("username")}<#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}<#else>${msg("email")}</#if></label>

                                        <div style="position: relative; display: flex; align-items: center;">
                                            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#8D8D8D" viewBox="0 0 24 24"
                                                 style="position: absolute; left: 1rem;">
                                                <path fill-rule="evenodd"
                                                      d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4h-4Z"
                                                      clip-rule="evenodd"/>
                                            </svg>
                                            <input tabindex="1" id="username" class="${properties.kcInputClass!}" name="username" value="${(login.username!'')}"
                                                   type="text" autofocus autocomplete="off"
                                                   aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>"
                                                   style="flex: 1; padding-left: 3rem; padding-right: 2.5rem;"
                                            />
                                            <svg class="input-btn" id="clearUsername" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18"
                                                 height="18" fill="#8D8D8D" viewBox="0 0 24 24"
                                                 style="position: absolute; right: 0.5rem; cursor: pointer;">
                                                <path fill-rule="evenodd"
                                                      d="M18 6.414 16.586 5 12 9.586 7.414 5 6 6.414 10.586 11 6 15.586 7.414 17 12 12.414 16.586 17 18 15.586 13.414 11 18 6.414Z"
                                                      clip-rule="evenodd"/>
                                            </svg>
                                        </div>

                                        <#if messagesPerField.existsError('username','password')>
                                            <span id="input-error" class="${properties.kcInputErrorMessageClass!}" aria-live="polite">
                                            ${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}
                                    </span>
                                        </#if>

                                    </div>
                                </#if>

                                <div class="${properties.kcFormGroupClass!}">
                                    <label for="password" class="${properties.kcLabelClass!}">${msg("password")}</label>

                                    <div style="position: relative; display: flex; align-items: center;">
                                        <input tabindex="2" id="password" class="${properties.kcInputClass!}" name="password" type="password" autocomplete="off"
                                               aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>"
                                               style="flex: 1; padding-left: 1rem; padding-right: 2.5rem;"
                                        />
                                        <svg class="input-btn" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor"
                                             viewBox="0 0 24 24"
                                             style="position: absolute; right: 0.5rem; cursor: pointer;" id="togglePassword">
                                            <path fill-rule="evenodd"
                                                  d="M4.998 7.78C6.729 6.345 9.198 5 12 5c2.802 0 5.27 1.345 7.002 2.78a12.713 12.713 0 0 1 2.096 2.183c.253.344.465.682.618.997.14.286.284.658.284 1.04s-.145.754-.284 1.04a6.6 6.6 0 0 1-.618.997 12.712 12.712 0 0 1-2.096 2.183C17.271 17.655 14.802 19 12 19c-2.802 0-5.27-1.345-7.002-2.78a12.712 12.712 0 0 1-2.096-2.183 6.6 6.6 0 0 1-.618-.997C2.144 12.754 2 12.382 2 12s.145-.754.284-1.04c.153-.315.365-.653.618-.997A12.714 12.714 0 0 1 4.998 7.78ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                                                  clip-rule="evenodd"/>
                                        </svg>
                                    </div>

                                    <#if usernameHidden?? && messagesPerField.existsError('username','password')>
                                        <span id="input-error" class="${properties.kcInputErrorMessageClass!}" aria-live="polite">
                                        ${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}
                                </span>
                                    </#if>

                                </div>

                                <div class="${properties.kcFormGroupClass!} ${properties.kcFormSettingClass!}">
                                    <div id="kc-form-options">
                                        <#if realm.rememberMe && !usernameHidden??>
                                            <div class="checkbox">
                                                <label>
                                                    <#if login.rememberMe??>
                                                        <input tabindex="3" id="rememberMe" name="rememberMe" type="checkbox" checked> ${msg("rememberMe")}
                                                    <#else>
                                                        <input tabindex="3" id="rememberMe" name="rememberMe" type="checkbox"> ${msg("rememberMe")}
                                                    </#if>
                                                </label>
                                            </div>
                                        </#if>
                                    </div>
                                    <div class="${properties.kcFormOptionsWrapperClass!} forgot-pw">
                                        <#if realm.resetPasswordAllowed>
                                            <span>
                                            <a
                                                    tabindex="5"
                                                    href="${url.loginResetCredentialsUrl}"
                                                    class=""
                                            >
                                                ${msg("doForgotPassword")}
                                            </a>
                                        </span>
                                        </#if>
                                    </div>

                                </div>

                                <div id="kc-form-buttons" class="${properties.kcFormGroupClass!}">
                                    <input type="hidden" id="id-hidden-input" name="credentialId"
                                           <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if>/>
                                    <input
                                            tabindex="4"
                                            class="${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!} ${properties.kcButtonBlockClass!} ${properties.kcButtonLargeClass!}"
                                            name="login"
                                            id="kc-login"
                                            type="submit"
                                            value="${msg("doLogIn")}"
                                    />
                                     <#if realm.password && realm.registrationAllowed && !registrationDisabled??>
                                    <input
                                            tabindex="6"
                                            class="${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!} ${properties.kcButtonBlockClass!} ${properties.kcButtonLargeClass!}"
                                            name="register"
                                            id="kc-register"
                                            type="button"
                                            value="${msg("doRegister")}"
                                            onclick="window.location.href='${url.registrationUrl}'"
                                            style="
                                                margin-top: 0.7rem; 
                                                color: black;
                                                background-color: white;
                                                border: #a3a3a3 1px solid;"
                                    />
                                    </#if>
                                </div>
                            </form>
                        </#if>
                    </div>

                </div>
            <#elseif section = "info" >
            <#elseif section = "socialProviders" >
                <#if realm.password && social.providers??>
                    <div id="kc-social-providers" class="${properties.kcFormSocialAccountSectionClass!}">
                        <hr/>
                        <h4>${msg("identity-provider-login-label")}</h4>

                        <ul class="${properties.kcFormSocialAccountListClass!} <#if social.providers?size gt 3>${properties.kcFormSocialAccountListGridClass!}</#if>">
                            <#list social.providers as p>
                                <a id="social-${p.alias}"
                                   class="${properties.kcFormSocialAccountListButtonClass!} <#if social.providers?size gt 3>${properties.kcFormSocialAccountGridItem!}</#if>"
                                   type="button" href="${p.loginUrl}">
                                    <#if p.iconClasses?has_content>
                                        <i class="${properties.kcCommonLogoIdP!} ${p.iconClasses!}" aria-hidden="true"></i>
                                        <span class="${properties.kcFormSocialAccountNameClass!} kc-social-icon-text">${p.displayName!}</span>
                                    <#else>
                                        <span class="${properties.kcFormSocialAccountNameClass!}">${p.displayName!}</span>
                                    </#if>
                                </a>
                            </#list>
                        </ul>
                    </div>
                </#if>
            </#if>

        </@layout.registrationLayout>
    </div>
    <div class="hub-panel">
        <div class="hub-panel-darken">
            <div class="hub-panel-content">
                <h1>${realm.displayName}</h1>
                <span>
                Wir wollen es den Kommunen leicht machen, mit ihren Daten zu arbeiten und Entscheidungen zu treffen.
                Zweitens wollen wir die Entwicklung intelligenter Anwendungen, die mit diesen Daten arbeiten und intelligente Entscheidungen treffen, erleichtern.
            </span>
                <br>
                <a class="learn-more-btn" target="_blank" rel="noopener noreferrer" href="https://urbanstack.de/">
                    Mehr erfahren
                    <svg class="learn-more-icon" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.9333 10.6V15.7552C15.9335 15.9187 15.9014 16.0806 15.8389 16.2317C15.7764 16.3828 15.6847 16.5201 15.5691 16.6357C15.4534 16.7513 15.3162 16.843 15.1651 16.9055C15.014 16.968 14.852 17.0001 14.6885 17H2.2448C2.08129 17.0001 1.91936 16.968 1.76827 16.9055C1.61718 16.843 1.4799 16.7513 1.36428 16.6357C1.24866 16.5201 1.15698 16.3828 1.09447 16.2317C1.03196 16.0806 0.99986 15.9187 1 15.7552V3.31147C0.99986 3.14796 1.03196 2.98603 1.09447 2.83494C1.15698 2.68385 1.24866 2.54657 1.36428 2.43095C1.4799 2.31533 1.61718 2.22364 1.76827 2.16114C1.91936 2.09863 2.08129 2.06653 2.2448 2.06667H7.17067M10.8475 1H17V7.15253M8.58507 9.41493L16.8816 1.1184"
                              stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </a>
            </div>
        </div>
    </div>
</div>

<script>
    document.getElementById('clearUsername').addEventListener('click', function () {
        document.getElementById('username').value = '';
    });

    document.getElementById('togglePassword').addEventListener('click', function () {
        const passwordInput = document.getElementById('password');
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
    });
</script>