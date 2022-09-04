#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { EfsEc2DemoStack } from '../lib/efs-ec2-demo-stack';

const app = new cdk.App();
new EfsEc2DemoStack(app, 'EfsEc2DemoStack', {
  vpcId: "vpc-00fe1afcc7928bb05",
  vpcName: "MyVpc",
  env: {
    region: process.env.CDK_DEFAULT_REGION,
    account: process.env.CDK_DEFAULT_ACCOUNT
  }
});
