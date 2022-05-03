# Next.js + Firebase + Cloud Run

## 목차
- [참고 자료](#참고-자료)
- [Firebase CLI](#firebase-cli)
- [Google Cloud CLI](#google-cloud-cli)
- [Docker](#docker)
- [GCP Artifact Registry](#gcp-artifact-registry)
- [GCP Cloud Build](#gcp-cloud-build)
- [GCP Cloud Run](#gcp-cloud-run)
- [GitHub + GCP Cloud Build](#github--gcp-cloud-build)
- [GitHub Actions + Firebase Hosting](#github-actions--firebase-hosting)
- [수동 배포](#수동-배포)

<br/><br/><br/>

## 참고 자료
> - https://cloud.google.com/docs/ci-cd
> - https://nextjs.org/docs/deployment#docker-image
> - https://cloud.google.com/build?hl=ko
> - https://cloud.google.com/build/docs/automating-builds/build-repos-from-github?hl=ko
> - https://cloud.google.com/artifact-registry?hl=ko
> - https://cloud.google.com/run?hl=ko
> - https://firebase.google.com/docs/hosting/github-integration?hl=ko
> - https://github.com/marketplace/actions/deploy-to-firebase-hosting
> - https://lynn-kwong.medium.com/build-a-docker-image-with-cloud-build-in-google-cloud-platform-5f6840af2c05
> - https://zzsza.github.io/gcp/2020/05/09/google-cloud-build/

<br/><br/><br/>

## Firebase CLI
- 설치
  > - https://firebase.google.com/docs/cli#mac-linux-npm
  ```shell
  npm install -g firebase-tools
  ```

- 계정 로그아웃
  ```shell
  firebase logout
  ```

- 계정 로그인
  ```shell
  firebase login
  ```

- 계정 추가
  ```shell
  firebase login:add
  ```

- 계정 목록
  ```shell
  firebase login:list
  ```

- 계정 전환
  ```shell
  firebase login:use {EMAIL}
  ```

- 프로젝트 목록
  ```shell
  firebase use
  ```

- 프로젝트 추가 및 별칭(alias) 생성
  - `.firebaserc` 파일 확인
  - 개발 프로젝트 별칭 : `development`
  - 테스트 프로젝트 별칭 : `test`
  - 운영 프로젝트 별칭 : `production`
  ```shell
  firebase use --add
  ```

- 프로젝트 전환
  ```shell
  firebase use {PROJECT_ID | PROJECT_ALIAS}
  ```

  - 개발 프로젝트 전환
    ```shell
    firebase use development
    ```

  - 테스트 프로젝트 전환
    ```shell
    firebase use test
    ```

  - 운영 프로젝트 전환
    ```shell
    firebase use production
    ```

<br/><br/><br/>

## Google Cloud CLI
- 설치
  > - https://cloud.google.com/sdk/docs/install#mac

- 계정 로그인
  ```shell
  gcloud auth login
  ```

- 계정 목록
  ```shell
  gcloud auth list
  ```

- 계정 전환
  ```shell
  gcloud config set account {EMAIL}
  ```

- 프로젝트 목록
  ```shell
  gcloud projects list
  ```

- 현재 프로젝트 확인
  ```shell
  gcloud config get-value project
  ```

- 프로젝트 전환
  ```shell
  gcloud config set project {PROJECT_ID}
  ```

  - 개발 프로젝트 전환
    ```shell
    gcloud config set project nextjs-2022-dev
    ```

  - 테스트 프로젝트 전환
    ```shell
    gcloud config set project nextjs-2022
    ```

  - 운영 프로젝트 전환
    ```shell
    gcloud config set project nextjs-2022
    ```

<br/><br/><br/>

## Docker
> - 로컬에서 Docker 이미지 실행 확인 방법

- Docker 이미지 생성
  ```shell
  docker build --build-arg BUILD_TARGET={PROJECT_ALIAS} -t {IMAGE_NAME} .
  ```

  - 개발
    ```shell
    docker build --build-arg BUILD_TARGET=dev -t docker-nextjs-dev .
    ```

  - 운영
    ```shell
    docker build --build-arg BUILD_TARGET=prod -t docker-nextjs .
    ```

- Docker 실행
  ```shell
  docker run -p 3000:3000 {IMAGE_NAME}
  ```

  - 개발
    ```shell
    docker run -p 3000:3000 docker-nextjs-dev
    ```

  - 운영
    ```shell
    docker run -p 3000:3000 docker-nextjs
    ```

- Docker 실행 확인
  > - http://localhost:3000

<br/><br/><br/>

## GCP Artifact Registry
> - https://cloud.google.com/artifact-registry/docs/docker/store-docker-container-images?hl=ko#gcloud

- 저장소 생성
  > - https://cloud.google.com/artifact-registry/docs/docker/store-docker-container-images?hl=ko#create
  ```shell
  gcloud artifacts repositories create {REPOSITORY_NAME} --repository-format=docker --location={REGION_NAME} --description="Docker repository"
  ```

  - 각 프로젝트 마다 실행
    ```shell
    gcloud artifacts repositories create docker-repo --repository-format=docker --location=asia-northeast3 --description="Docker repository"
    ```

- 저장소 목록 확인
  ```shell
  gcloud artifacts repositories list
  ```

- Docker 인증 파일 생성
  > - https://cloud.google.com/artifact-registry/docs/docker/store-docker-container-images?hl=ko#auth
  ```shell
  gcloud auth configure-docker {REGION_NAME}-docker.pkg.dev
  ```

  - 각 프로젝트 마다 실행
    ```shell
    gcloud auth configure-docker asia-northeast3-docker.pkg.dev
    ```

- Docker 이미지 주소 형식
  > - https://cloud.google.com/artifact-registry/docs/docker/names?hl=ko
  ```text
  {GCP_LOCATION}-docker.pkg.dev/{GCP_PROJECT_ID}/{GCP_REPOSITORY}/{GCP_IMAGE_NAME}
  ```

  - 개발
    ```text
    asia-northeast3-docker.pkg.dev/nextjs-2022-dev/docker-repo/docker-nextjs-dev
    ```

  - 운영
    ```text
    asia-northeast3-docker.pkg.dev/nextjs-2022/docker-repo/docker-nextjs
    ```

- 태그 생성
  ```shell
  docker tag {IMAGE_NAME} {REGION_NAME}-docker.pkg.dev/{PROJECT_ID}/{REPOSITORY_NAME}/{IMAGE_NAME}
  ```

  - 개발
    ```shell
    docker tag docker-nextjs-dev asia-northeast3-docker.pkg.dev/nextjs-2022-dev/docker-repo/docker-nextjs-dev
    ```

  - 운영
    ```shell
    docker tag docker-nextjs asia-northeast3-docker.pkg.dev/nextjs-2022/docker-repo/docker-nextjs
    ```

- 이미지 업로드
  ```shell
  docker push {REGION_NAME}-docker.pkg.dev/{PROJECT_ID}/{REPOSITORY_NAME}/{IMAGE_NAME}
  ```

  - 개발
    ```shell
    docker push asia-northeast3-docker.pkg.dev/nextjs-2022-dev/docker-repo/docker-nextjs-dev
    ```

  - 운영
    ```shell
    docker push asia-northeast3-docker.pkg.dev/nextjs-2022/docker-repo/docker-nextjs
    ```

<br/><br/><br/>

## GCP Cloud Build
- 빌드 생성
  > - https://cloud.google.com/build/docs/build-push-docker-image?hl=ko#build_an_image_using_dockerfile
  ```shell
  gcloud builds submit --tag {REGION_NAME}-docker.pkg.dev/{PROJECT_ID}/{REPOSITORY_NAME}/{IMAGE_NAME} --project {PROJECT_ID}
  ```

  - 개발
    ```shell
    gcloud builds submit --tag asia-northeast3-docker.pkg.dev/nextjs-2022-dev/docker-repo/docker-nextjs-dev --project nextjs-2022-dev
    ```

  - 운영
    ```shell
    gcloud builds submit --tag asia-northeast3-docker.pkg.dev/nextjs-2022/docker-repo/docker-nextjs --project nextjs-2022
    ```

- 빌드 배포 서비스 계정 권한
  > - https://cloud.google.com/build/docs/deploying-builds/deploy-cloud-run#continuous-iam
  ```shell
  gcloud iam service-accounts add-iam-policy-binding \
    {PROJECT_NUMBER}-compute@developer.gserviceaccount.com \
    --member="serviceAccount:{PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser"
  ```

  - 개발 프로젝트
    ```shell
    ```

  - 테스트, 운영 프로젝트
    ```shell
    gcloud iam service-accounts add-iam-policy-binding \
      28623504743-compute@developer.gserviceaccount.com \
      --member="serviceAccount:28623504743@cloudbuild.gserviceaccount.com" \
      --role="roles/iam.serviceAccountUser"
    ```

- 빌드 구성 파일 설정
  > - https://cloud.google.com/build/docs/build-config-file-schema?hl=ko
  > - https://cloud.google.com/build/docs/cloud-builders?hl=ko
  > - https://cloud.google.com/build/docs/configuring-builds/create-basic-configuration?hl=ko
  > - https://cloud.google.com/build/docs/building/build-containers?hl=ko#use-buildconfig
  > - https://cloud.google.com/build/docs/deploying-builds/deploy-cloud-run?hl=ko#building_and_deploying_a_container

  - Docker 이미지 생성 구성
    - [권장] 방법 1
      ```yml
      steps:
      # Build the container image
      - name: 'gcr.io/cloud-builders/docker'
        args: ['build', '-t', '{REGION_NAME}-docker.pkg.dev/{PROJECT_ID}/{REPOSITORY_NAME}/{IMAGE_NAME}', '.', '--build-arg', 'BUILD_TARGET={PROJECT_ALIAS}', '--no-cache']
      ```
    - 방법 2
      ```yml
      steps:
      # Build the container image
      - name: 'gcr.io/cloud-builders/docker'
        entrypoint: 'bash'
        args: ['-c', 'docker build -t {REGION_NAME}-docker.pkg.dev/{PROJECT_ID}/{REPOSITORY_NAME}/{IMAGE_NAME} . --build-arg BUILD_TARGET={PROJECT_ALIAS} --no-cache']
      ```

  - Docker 이미지 생성 + Artifact Registry에 이미지 업로드 + Cloud Run 배포
    - 파일명 : `cloudbuild.yaml`
    ```yml
    steps:
    # Build the container image
    - name: 'gcr.io/cloud-builders/docker'
      args: ['build', '-t', '{REGION_NAME}-docker.pkg.dev/{PROJECT_ID}/{REPOSITORY_NAME}/{IMAGE_NAME}', '.', '--build-arg', 'BUILD_TARGET={PROJECT_ALIAS}', '--no-cache']
    # Push the container image to Artifact Registry
    - name: 'gcr.io/cloud-builders/docker'
      args: ['push', '{REGION_NAME}-docker.pkg.dev/{PROJECT_ID}/{REPOSITORY_NAME}/{IMAGE_NAME}']
    # Deploy container image to Cloud Run
    - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
      entrypoint: gcloud
      args: ['run', 'deploy', '{IMAGE_NAME}', '--image', '{REGION_NAME}-docker.pkg.dev/{PROJECT_ID}/{REPOSITORY_NAME}/{IMAGE_NAME}', '--platform', 'managed', '--region', '{REGION_NAME}', '--allow-unauthenticated', '--memory', '512Mi', '--min-instances', '0']
    images:
    - {REGION_NAME}-docker.pkg.dev/{PROJECT_ID}/{REPOSITORY_NAME}/{IMAGE_NAME}
    timeout: 1800s
    ```

    - 개발 구성 파일
      - 파일명 : `cloudbuild.dev.yaml`

    - 테스트 구성 파일
      - 파일명 : `cloudbuild.test.yaml`

    - 운영 구성 파일
      - 파일명 : `cloudbuild.prod.yaml`
      ```yml
      steps:
      # Build the container image
      - name: 'gcr.io/cloud-builders/docker'
        args: ['build', '-t', 'asia-northeast3-docker.pkg.dev/nextjs-2022/docker-repo/docker-nextjs', '.', '--build-arg', 'BUILD_TARGET=prod', '--no-cache']
      # Push the container image to Artifact Registry
      - name: 'gcr.io/cloud-builders/docker'
        args: ['push', 'asia-northeast3-docker.pkg.dev/nextjs-2022/docker-repo/docker-nextjs']
      # Deploy container image to Cloud Run
      - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
        entrypoint: gcloud
        args: ['run', 'deploy', 'docker-nextjs', '--image', 'asia-northeast3-docker.pkg.dev/nextjs-2022/docker-repo/docker-nextjs', '--platform', 'managed', '--region', 'asia-northeast3', '--allow-unauthenticated', '--memory', '512Mi', '--min-instances', '0']
      images:
      - asia-northeast3-docker.pkg.dev/nextjs-2022/docker-repo/docker-nextjs
      timeout: 1800s
      ```

- 빌드 구성 실행
  ```shell
  gcloud builds submit --config {BUILD_CONFIG_FILE} {SOURCE_DIRECTORY}
  ```

  - 개발
    ```shell
    gcloud builds submit --config cloudbuild.dev.yaml .
    ```

  - 운영
    ```shell
    gcloud builds submit --config cloudbuild.prod.yaml .
    ```

<br/><br/><br/>

## GCP Cloud Run
- 배포
  > - https://cloud.google.com/artifact-registry/docs/integrate-cloud-run?hl=ko#command-line
  > - https://cloud.google.com/run/docs/deploying?hl=ko#command-line
  > - https://cloud.google.com/run/docs/configuring/min-instances?hl=ko
  > - https://cloud.google.com/run/docs/configuring/memory-limits?hl=ko
  ```shell
  gcloud run deploy SERVICE --image REPO-LOCATION-docker.pkg.dev/PROJECT-ID/REPOSITORY/IMAGE \
  [--platform managed --region RUN-REGION]
  ```
  ```shell
  gcloud run deploy {IMAGE_NAME} --image {REGION_NAME}-docker.pkg.dev/{PROJECT_ID}/{REPOSITORY_NAME}/{IMAGE_NAME} --project {PROJECT_ID} --platform managed --region {REGION_NAME} --allow-unauthenticated --memory 512Mi --min-instances 0
  ```

  - 개발
    ```shell
    gcloud run deploy docker-nextjs-dev --image asia-northeast3-docker.pkg.dev/nextjs-2022-dev/docker-repo/docker-nextjs-dev --project nextjs-2022-dev --platform managed --region asia-northeast3 --allow-unauthenticated --memory 512Mi --min-instances 0
    ```

  - 운영
    ```shell
    gcloud run deploy docker-nextjs --image asia-northeast3-docker.pkg.dev/nextjs-2022/docker-repo/docker-nextjs --project nextjs-2022 --platform managed --region asia-northeast3 --allow-unauthenticated --memory 512Mi --min-instances 0
    ```

<br/><br/><br/>

## GitHub + GCP Cloud Build
> - https://cloud.google.com/build/docs/automating-builds/build-repos-from-github

<br/><br/><br/>

## GitHub Actions + Firebase Hosting
> - https://firebase.google.com/docs/hosting/github-integration?hl=ko
> - https://github.com/marketplace/actions/deploy-to-firebase-hosting
> - https://github.com/FirebaseExtended/action-hosting-deploy
> - https://firebase.google.com/docs/hosting/multisites
```shell
firebase use {PROJECT_ID | PROJECT_ALIAS}
firebase target:apply hosting {HOSTING_TARGET_NAME} {HOSTING_SITE_NAME}
firebase init hosting:github
```

- 개발 설정
  ```shell
  firebase use development
  firebase target:apply hosting development nextjs-2022-dev
  firebase init hosting:github
  ```

- 테스트 설정
  ```shell
  firebase use test
  firebase target:apply hosting test nextjs-2022-test
  firebase init hosting:github
  ```

- 운영 설정
  ```shell
  firebase use production
  firebase target:apply hosting production nextjs-2022
  firebase init hosting:github
  ```

- `.firebaserc` 파일 내용
  ```json
  {
    "projects": {
      "default": "nextjs-2022-dev",
      "development": "nextjs-2022-dev",
      "test": "nextjs-2022",
      "production": "nextjs-2022"
    },
    "targets": {
      "nextjs-2022-dev": {
        "hosting": {
          "development": [
            "nextjs-2022-dev"
          ]
        }
      },
      "nextjs-2022": {
        "hosting": {
          "test": [
            "nextjs-2022-test"
          ],
          "production": [
            "nextjs-2022"
          ]
        }
      }
    }
  }
  ```

<br/><br/><br/>

## 수동 배포
- GCP Cloud Run 배포
  ```shell
  yarn cloudbuild:submit:dev
  ```

- Firebase Hosting 배포
  ```shell
  yarn firebase:deploy:dev
  ```
