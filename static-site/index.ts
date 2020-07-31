import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

const zoneName = "sigma.city";
const appName = "svelte";
const domainName = `${appName}.${zoneName}`;

const api = new awsx.apigateway.API("mysite", {
    routes: [
        {
            localPath: "app/public",
            path: "/"
        },
    ],
});

// note ACM runs on us-east-1
const provider = new aws.Provider("east", { region: "us-east-1" });
const cert = pulumi.output(aws.acm.getCertificate({
    domain: `*.${zoneName}`
}, { async: true, provider }));

const apiGwDomain = new aws.apigateway.DomainName(appName, {
    certificateArn: cert.arn,
    domainName
});

const zone = pulumi.output(aws.route53.getZone({
    name: "sigma.city"
}, { async: true }));

const record = new aws.route53.Record(domainName, {
    name: appName,
    type: "A",
    zoneId: zone.zoneId,
    aliases: [{
        name: apiGwDomain.cloudfrontDomainName,
        zoneId: apiGwDomain.cloudfrontZoneId,
        evaluateTargetHealth: true,
    }],
});

const domainMapping = new aws.apigateway.BasePathMapping(`${appName}-apigw-mapping`, {
    restApi: api.restAPI.id,
    domainName: apiGwDomain.domainName,
    stageName: api.stage.stageName,
});

export const apiUrl = api.url;
export const domain = record.fqdn;
export const siteUrl = pulumi.interpolate`https://${domain}`;
