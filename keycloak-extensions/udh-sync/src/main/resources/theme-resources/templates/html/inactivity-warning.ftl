<html>
<#include "common-header.ftl">
<body>
${kcSanitize(msg("urbanstackGreeting"))?no_esc}
${kcSanitize(msg("inactivityWarningHtml", dataHubUrl, deletionInDays))?no_esc}
<#include "common-footer.ftl">
</body>
</html>
