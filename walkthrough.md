# Final Step: AWS S3 & GitHub Actions Walkthrough

Awesome! I see you have successfully pushed your code to your GitHub repository (`shivanshu360/chatbot`). 

I have just created a GitHub Actions workflow file locally at `.github/workflows/deploy.yml`. Once you commit and push this new file, it will tell GitHub to automatically build and upload your site to AWS S3!

However, before you push this file, you **must complete the following steps manually** so GitHub has permission to access your AWS account.

---

## Step 1: Create an S3 Bucket on AWS

1. Log in to the [AWS Management Console](https://console.aws.amazon.com/).
2. Search for **S3** and open the service.
3. Click **Create bucket**.
4. **Bucket name**: Choose a globally unique name (e.g., `shivanshu-chatbot-prod`).
5. **Object Ownership**: Leave as "ACLs disabled (recommended)".
6. **Block Public Access settings**: **UNCHECK** the box that says "Block *all* public access" and acknowledge the warning. (Your website needs to be public for people to view it).
7. Click **Create bucket** at the bottom.

## Step 2: Enable Static Website Hosting

1. Click on your newly created bucket name.
2. Go to the **Properties** tab.
3. Scroll to the very bottom to **Static website hosting** and click **Edit**.
4. Select **Enable**.
5. Set the **Index document** to `index.html`.
6. Click **Save changes**.

## Step 3: Add a Public Read Policy

1. Go to the **Permissions** tab of your bucket.
2. Scroll down to **Bucket policy** and click **Edit**.
3. Paste the following JSON, replacing `YOUR-BUCKET-NAME` with your actual bucket name:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
        }
    ]
}
```
4. Click **Save changes**.

## Step 4: Create an AWS IAM User for GitHub

GitHub needs an Access Key to upload files to your bucket.

1. In the AWS Console search bar, search for **IAM** and open it.
2. Go to **Users** (on the left sidebar) and click **Create user**.
3. Name the user `github-actions-deploy` and click Next.
4. Select **Attach policies directly**.
5. Search for and check `AmazonS3FullAccess`. Click Next, then **Create user**.
6. Click on your new `github-actions-deploy` user.
7. Go to the **Security credentials** tab.
8. Scroll down to **Access keys** and click **Create access key**.
9. Select **Third-party service**, check the confirmation box, and click Next.
10. Click **Create access key**.
11. **KEEP THIS SCREEN OPEN!** You will need the Access Key ID and Secret Access Key for the next step.

## Step 5: Add Secrets to GitHub

Now, tell GitHub your secrets.

1. Go to your repository on GitHub (`https://github.com/shivanshu360/chatbot`).
2. Click on **Settings** > **Secrets and variables** (on the left sidebar) > **Actions**.
3. Click the **New repository secret** button to add the following 4 secrets:
    *   Name: `AWS_ACCESS_KEY_ID` | Value: *(Paste from Step 4)*
    *   Name: `AWS_SECRET_ACCESS_KEY` | Value: *(Paste from Step 4)*
    *   Name: `AWS_S3_BUCKET` | Value: *(The exact name of your S3 bucket)*
    *   Name: `VITE_GEMINI_API_KEY` | Value: `AIzaSyD5693q5gU_qYqm5qU-TumpeN9h5unUCtQ`

## Step 6: Push the Workflow!

Once the secrets are added to GitHub, you are ready to trigger the deployment. Go back to your terminal (in VS Code) and run:

```bash
git add .
git commit -m "Add GitHub Actions workflow"
git push
```

If you go to the **Actions** tab on your GitHub repository, you will see the deployment running! Once it turns green, go to the **Properties** tab of your S3 bucket, scroll to the bottom, and click the **Bucket website endpoint** URL to see your live Chat Bot!
