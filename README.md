## Setup EFS for EC2 Instances 
- cdk to create a efs file system in an existing vpc 
- configure mount point target in the vpc 
- mount the efs to ec2 instances 


## EFS Stack 
look up the existing vpc 
```tsx
const vpc = cdk.aws_ec2.Vpc.fromLookup(
  this,
  "ExistedVpc",
  {
    region: this.region,
    vpcId: props.vpcId,
    vpcName: props.vpcName
  }
)
```

security group for efs file system 
```tsx
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
```

efs file system cdk L2 construct 
```tsx
const efs = new cdk.aws_efs.FileSystem(
  this,
  "EfsDemo",
  {
    fileSystemName: "EfsDemo",
    vpc: vpc,
    performanceMode: cdk.aws_efs.PerformanceMode.GENERAL_PURPOSE,
    securityGroup: efsSecurityGroup
    // default mount point target will be created per subnet 
    // vpcSubnets to select subnet for mount target 
  }
)
```

## Mount FileSystem in an EC2 
- associate the security of mount targest with ec2 on nfs 2049 port 
- install amazon-efs-utils in ec2 
- mount options and commands 


```bash 
sudo yum install -y amazon-efs-utils
```

```bash 
sudo mount -t efs -o tls fs-05ede5fe007965c7b:/ efs
```
