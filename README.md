# nextjs-firebase-docker



## GCP SDK
```shell
gcloud auth login

gcloud config set project nextjs-2022

gcloud config get-value project
```



## Firebase SDK
```shell
firebase logout
firebase login

firebase use nextjs-2022
```



## GCP Container Registry
```shell
cd docker

yarn

gcloud builds submit --tag gcr.io/nextjs-2022/docker-nextjs --project nextjs-2022

cd ..

gcloud run deploy --image gcr.io/nextjs-2022/docker-nextjs --project nextjs-2022 --platform managed
```


## GCP Artifact Registry

> - https://cloud.google.com/artifact-registry/docs/docker/store-docker-container-images?hl=ko#gcloud
```shell
gcloud artifacts repositories create docker-repo --repository-format=docker --location=asia-northeast3 --description="Docker repository"

gcloud artifacts repositories list

gcloud auth configure-docker asia-northeast3-docker.pkg.dev


cd docker

yarn

docker build -t docker-nextjs .

cd ..

docker run -p 3000:3000 docker-nextjs
```

- http://localhost:3000


> - https://cloud.google.com/artifact-registry/docs/docker/names?hl=ko
```
{GCP_LOCATION}-docker.pkg.dev/{GCP_PROJECT_ID}/{GCP_REPOSITORY}/{GCP_IMAGE_NAME}
docker tag docker-nextjs asia-northeast3-docker.pkg.dev/nextjs-2022/docker-repo/docker-nextjs
```

```shell
docker push asia-northeast3-docker.pkg.dev/nextjs-2022/docker-repo/docker-nextjs
```

> - https://cloud.google.com/artifact-registry/docs/integrate-cloud-run?hl=ko#command-line
> - https://cloud.google.com/run/docs/deploying?hl=ko#command-line
> - https://cloud.google.com/run/docs/configuring/memory-limits?hl=ko
> - https://cloud.google.com/run/docs/configuring/min-instances?hl=ko
```shell
gcloud run deploy SERVICE --image REPO-LOCATION-docker.pkg.dev/PROJECT-ID/REPOSITORY/IMAGE \
[--platform managed --region RUN-REGION]
```
```shell
gcloud run deploy docker-nextjs --image asia-northeast3-docker.pkg.dev/nextjs-2022/docker-repo/docker-nextjs --project nextjs-2022 --platform managed --region asia-northeast3 --allow-unauthenticated --memory 512Mi --min-instances 1
```


## GCP Cloud Build

> - https://cloud.google.com/build/docs/deploying-builds/deploy-cloud-run#continuous-iam
```shell
gcloud iam service-accounts add-iam-policy-binding \
  28623504743-compute@developer.gserviceaccount.com \
  --member="serviceAccount:28623504743@cloudbuild.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

```shell
gcloud builds submit --config cloudbuild.yaml .
```


## Firebase Hosting
```shell
cd firebase

yarn

yarn deploy

cd ..
```

