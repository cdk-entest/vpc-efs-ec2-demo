import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { StackProps, Stack } from 'aws-cdk-lib';
import { Effect } from 'aws-cdk-lib/aws-iam';
import { warn } from 'console';

interface EfsEc2DemoProps extends StackProps {
  vpcId: string;
  vpcName: string
}

export class EfsEc2DemoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: EfsEc2DemoProps) {
    super(scope, id, props);

    const vpc = cdk.aws_ec2.Vpc.fromLookup(
      this,
      "ExistedVpc",
      {
        region: this.region,
        vpcId: props.vpcId,
        vpcName: props.vpcName
      }
    )

    const role = new cdk.aws_iam.Role(
      this,
      "RoleForEc2AccessEfs",
      {
        roleName: "RoleForEc2AccessEfs",
        assumedBy: new cdk.aws_iam.ServicePrincipal("ec2.amazonaws.com")
      }
    )

    role.addManagedPolicy(
      cdk.aws_iam.ManagedPolicy.fromManagedPolicyArn(
        this,
        "PolicyToAccessSSM",
        "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
      )
    )

    const ec2SecurityGroup = new cdk.aws_ec2.SecurityGroup(
      this,
      "Ec2SecurityGroup",
      {
        securityGroupName: "Ec2SecurityGroup",
        vpc: vpc
      }
    )

    new cdk.aws_ec2.Instance(
      this,
      "PubEc2",
      {
        instanceName: "PubEc2",
        vpc: vpc,
        securityGroup: ec2SecurityGroup,
        role: role,
        instanceType: cdk.aws_ec2.InstanceType.of(
          cdk.aws_ec2.InstanceClass.T3,
          cdk.aws_ec2.InstanceSize.SMALL
        ),
        machineImage: new cdk.aws_ec2.AmazonLinuxImage(
          {
            generation: cdk.aws_ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
            edition: cdk.aws_ec2.AmazonLinuxEdition.STANDARD
          }
        )
      }
    )

    // efs security group  
    const efsSecurityGroup = new cdk.aws_ec2.SecurityGroup(
      this,
      "EfsSecurityGroup",
      {
        securityGroupName: "EfsSecurityGroup",
        vpc: vpc
      }
    )

    efsSecurityGroup.addIngressRule(
      cdk.aws_ec2.Peer.securityGroupId(ec2SecurityGroup.securityGroupId),
      cdk.aws_ec2.Port.tcp(2049),
      "associate with security group of the ec2"
    )

    // efs 
    const efs = new cdk.aws_efs.FileSystem(
      this,
      "EfsDemo",
      {
        fileSystemName: "EfsDemo",
        vpc: vpc,
        performanceMode: cdk.aws_efs.PerformanceMode.GENERAL_PURPOSE,
        securityGroup: efsSecurityGroup
      }
    )
  }
}



