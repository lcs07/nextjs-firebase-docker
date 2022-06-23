# Next.js + Firebase + Cloud Run

[![Deploy to Firebase Hosting on merge PROD](https://github.com/lcs07/nextjs-firebase-docker/actions/workflows/firebase-hosting-merge-prod.yml/badge.svg)](https://github.com/lcs07/nextjs-firebase-docker/actions/workflows/firebase-hosting-merge-prod.yml)

<br/><br/><br/>

# 목차
- [참고 자료](#참고-자료)
  - [CI/CD 관련](#cicd-관련)
- [CI/CD 설정](#cicd-설정)
  - [CI/CD 목표](#cicd-목표)
  - [프로젝트 정보](#프로젝트-정보)
    - [Project ID](#project-id)
    - [Project Alias](#project-alias)
    - [Firebase Hosting site name](#firebase-hosting-site-name)
    - [GCP Cloud Run service name (Docker image name)](#gcp-cloud-run-service-name-docker-image-name)
  - [Firebase CLI](#firebase-cli)
  - [Google Cloud CLI](#google-cloud-cli)
  - [Docker](#docker)
  - [GCP Artifact Registry](#gcp-artifact-registry)
  - [GCP Cloud Build](#gcp-cloud-build)
  - [GCP Cloud Run](#gcp-cloud-run)
  - [GitHub + GCP Cloud Build](#github--gcp-cloud-build)
  - [GitHub Actions + Firebase Hosting](#github-actions--firebase-hosting)
- [수동 배포](#수동-배포)
  - [WEB에서 직접 배포](#web에서-직접-배포)
  - [개발자 PC에서 직접 배포](#개발자-pc에서-직접-배포)

<br/><br/><br/>

---

<br/><br/><br/>

# 참고 자료
- ## CI/CD 관련
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

---

<br/><br/><br/>

# CI/CD 설정

## CI/CD 목표
> - git `dev` 브랜치에 push(PR merge) 이벤트 발생시 개발, 테스트 서버에 자동 배포
> - git `main` 브랜치에 push(PR merge) 이벤트 발생시 운영 서버에 자동 배포
> - `Docker`를 사용해서 `Next.js` 다국어 지원(`next-i18next`) 관련 오류 해결
> - `Firebase Functions`로 `Next.js` 사용시 서비스 제공에 오래 걸리는 문제 해결
> - `Docker`를 이용하기 위해 `Firebase Hosting`과 연동 가능한 `Cloud Run` 서비스 사용
> - 이미지 파일 등의 정적인 파일은 `Firebase Hosting`으로 제공
> - `Next.js`에서 처리되어야 하는 동적인 컨텐츠는 `Cloud Run`으로 제공

- `Next.js`
  - `Docker` 이미지를 빌드하기 위해 `Cloud Build` 서비스 사용
  - 빌드 된 이미지를 저장하기 위해 `Artifact Registry` 서비스 사용
  - 빌드 된 이미지는 `Cloud Run` 서비스로 배포
  - `Cloud Build`에서 `Cloud Run` 까지 빌드 및 배포 자동화를 위해 `Cloud Build`의 빌드 구성 파일 설정

- 정적 파일
  - 정적인 파일은 `Firebase Hosting`으로 제공하고 그외의 콘텐츠는 `Cloud Run`으로 연결
  - 정적인 파일은 빌드가 필요 없음
  - `GitHub Actions`로 `Firebase Hosting`에 배포

<br/><br/><br/>

## 프로젝트 정보
### Project ID
- 개발
  - Project ID : `nextjs-2022-dev`
  - Project Number : ``
- 테스트, 운영
  - Project ID : `nextjs-2022`
  - Project Number : `28623504743`

### Project Alias
> - 프로젝트 별칭
- 개발 : `development`
- 테스트 : `test`
- 운영 : `production`

### Firebase Hosting site name
- 개발 : `nextjs-2022-dev`
- 테스트 : `nextjs-2022-test`
- 운영 : `nextjs-2022`

### GCP Cloud Run service name (Docker image name)
> - Cloud Run service name은 Docker image name과 동일하지 않아도 됨
> - 관리 편의를 위해 동일하게 처리
- 개발 : `docker-nextjs-dev`
- 테스트 : `docker-nextjs-test`
- 운영 : `docker-nextjs`

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

  - 테스트, 운영 프로젝트 전환
    ```shell
    gcloud config set project nextjs-2022
    ```

<br/><br/><br/>

## Docker
> - 로컬에서 Docker 이미지 실행 확인 방법

- `Dockerfile` 파일 생성
  ```dockerfile
  # Install dependencies only when needed
  FROM node:16-alpine AS deps
  # Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
  RUN apk add --no-cache libc6-compat
  WORKDIR /app
  COPY package.json yarn.lock ./
  RUN yarn install --frozen-lockfile

  # If using npm with a `package-lock.json` comment out above and use below instead
  # COPY package.json package-lock.json ./ 
  # RUN npm ci

  # Rebuild the source code only when needed
  FROM node:16-alpine AS builder
  WORKDIR /app
  COPY --from=deps /app/node_modules ./node_modules
  COPY . .

  # Next.js collects completely anonymous telemetry data about general usage.
  # Learn more here: https://nextjs.org/telemetry
  # Uncomment the following line in case you want to disable telemetry during the build.
  # ENV NEXT_TELEMETRY_DISABLED 1

  # $ docker build -t docker-nextjs-dev --build-arg BUILD_TARGET=dev .
  # $ docker build -t docker-nextjs-test --build-arg BUILD_TARGET=test .
  # $ docker build -t docker-nextjs --build-arg BUILD_TARGET=prod .
  ARG BUILD_TARGET
  RUN echo "BUILD_TARGET: $BUILD_TARGET"

  # RUN yarn build:$BUILD_TARGET
  RUN yarn env:$BUILD_TARGET yarn next:build

  # If using npm comment out above and use below instead
  # RUN npm run build

  # Production image, copy all the files and run next
  FROM node:16-alpine AS runner
  WORKDIR /app

  ENV NODE_ENV production
  # Uncomment the following line in case you want to disable telemetry during runtime.
  # ENV NEXT_TELEMETRY_DISABLED 1

  RUN addgroup --system --gid 1001 nodejs
  RUN adduser --system --uid 1001 nextjs

  # You only need to copy next.config.js if you are NOT using the default configuration
  COPY --from=builder /app/next.config.js ./
  # COPY --from=builder /app/public ./public
  COPY --from=builder /app/public/locales ./public/locales
  COPY --from=builder /app/package.json ./package.json

  # Automatically leverage output traces to reduce image size 
  # https://nextjs.org/docs/advanced-features/output-file-tracing
  COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
  COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

  USER nextjs

  EXPOSE 3000

  ENV PORT 3000

  CMD ["node", "server.js"]
  ```

- Docker 이미지 생성
  ```shell
  docker build --build-arg BUILD_TARGET={PROJECT_ALIAS} -t {IMAGE_NAME} .
  ```

  - 개발
    ```shell
    docker build --build-arg BUILD_TARGET=dev -t docker-nextjs-dev .
    ```

  - 테스트
    ```shell
    docker build --build-arg BUILD_TARGET=test -t docker-nextjs-test .
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

  - 테스트
    ```shell
    docker run -p 3000:3000 docker-nextjs-test
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
  {REGION_NAME}-docker.pkg.dev/{PROJECT_ID}/{REPOSITORY_NAME}/{IMAGE_NAME}
  ```

  - 개발
    ```text
    asia-northeast3-docker.pkg.dev/nextjs-2022-dev/docker-repo/docker-nextjs-dev
    ```

  - 테스트
    ```text
    asia-northeast3-docker.pkg.dev/nextjs-2022/docker-repo/docker-nextjs-test
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

  - 테스트
    ```shell
    docker tag docker-nextjs-test asia-northeast3-docker.pkg.dev/nextjs-2022/docker-repo/docker-nextjs-test
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

  - 테스트
    ```shell
    docker push asia-northeast3-docker.pkg.dev/nextjs-2022/docker-repo/docker-nextjs-test
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

  - 테스트
    ```shell
    gcloud builds submit --tag asia-northeast3-docker.pkg.dev/nextjs-2022/docker-repo/docker-nextjs-test --project nextjs-2022
    ```

  - 운영
    ```shell
    gcloud builds submit --tag asia-northeast3-docker.pkg.dev/nextjs-2022/docker-repo/docker-nextjs --project nextjs-2022
    ```

- 빌드 배포 서비스 계정 권한
  - 필수 IAM 권한
    > - https://cloud.google.com/build/docs/deploying-builds/deploy-cloud-run#required_iam_permissions
    - `Google Cloud Console` -> `Cloud Build` -> `설정` -> `서비스 계정` -> `Cloud Run` 사용 설정

  - 최소 IAM 권한
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
    - 샘플 파일명 : `cloudbuild.yaml`
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

  - 테스트
    ```shell
    gcloud builds submit --config cloudbuild.test.yaml .
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
  gcloud run deploy {SERVICE_NAME} --image {REGION_NAME}-docker.pkg.dev/{PROJECT_ID}/{REPOSITORY_NAME}/{IMAGE_NAME} --project {PROJECT_ID} --platform managed --region {REGION_NAME} --allow-unauthenticated --memory 512Mi --min-instances 0
  ```

  - 개발
    ```shell
    gcloud run deploy docker-nextjs-dev --image asia-northeast3-docker.pkg.dev/nextjs-2022-dev/docker-repo/docker-nextjs-dev --project nextjs-2022-dev --platform managed --region asia-northeast3 --allow-unauthenticated --memory 512Mi --min-instances 0
    ```

  - 테스트
    ```shell
    gcloud run deploy docker-nextjs-test --image asia-northeast3-docker.pkg.dev/nextjs-2022/docker-repo/docker-nextjs-test --project nextjs-2022 --platform managed --region asia-northeast3 --allow-unauthenticated --memory 512Mi --min-instances 0
    ```

  - 운영
    ```shell
    gcloud run deploy docker-nextjs --image asia-northeast3-docker.pkg.dev/nextjs-2022/docker-repo/docker-nextjs --project nextjs-2022 --platform managed --region asia-northeast3 --allow-unauthenticated --memory 512Mi --min-instances 0
    ```

<br/><br/><br/>

## GitHub + GCP Cloud Build
> - https://cloud.google.com/build/docs/automating-builds/build-repos-from-github

![GCP Cloud Build Dashboard](https://github.com/lcs07/nextjs-firebase-docker/blob/dev/public/images/GCP_Cloud_Build_Dashboard.png?raw=true)

- 트리거 생성
  - Cloud Build 콘솔에서 트리거 생성
  - Cloud Build GitHub 앱 연동
    - GitHub 저장소 접근 권한 설정

<br/><br/><br/>

## GitHub Actions + Firebase Hosting
> - https://firebase.google.com/docs/hosting/github-integration?hl=ko
> - https://github.com/marketplace/actions/deploy-to-firebase-hosting
> - https://github.com/FirebaseExtended/action-hosting-deploy
> - https://firebase.google.com/docs/hosting/multisites
> - https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#workflow_dispatch

![GitHub Actions](https://github.com/lcs07/nextjs-firebase-docker/blob/dev/public/images/GitHub_Actions.png?raw=true)

- GitHub 연동 설정
  ```shell
  firebase use {PROJECT_ID | PROJECT_ALIAS}
  firebase target:apply hosting {HOSTING_TARGET_NAME} {HOSTING_SITE_NAME}
  firebase init hosting:github
  ```

  - 개발
    ```shell
    firebase use development
    firebase target:apply hosting development nextjs-2022-dev
    firebase init hosting:github
    ```
    - GitHub workflow 파일명 변경
      - 기존 : `.github/workflows/firebase-hosting-merge.yml`
      - 변경 : `.github/workflows/firebase-hosting-merge-dev.yml`

  - 테스트
    ```shell
    firebase use test
    firebase target:apply hosting test nextjs-2022-test
    firebase init hosting:github
    ```
    - GitHub workflow 파일명 변경
      - 기존 : `.github/workflows/firebase-hosting-merge.yml`
      - 변경 : `.github/workflows/firebase-hosting-merge-test.yml`


  - 운영
    ```shell
    firebase use production
    firebase target:apply hosting production nextjs-2022
    firebase init hosting:github
    ```
    - GitHub workflow 파일명 변경
      - 기존 : `.github/workflows/firebase-hosting-merge.yml`
      - 변경 : `.github/workflows/firebase-hosting-merge-prod.yml`

- `.firebaserc` 파일 내용 확인
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

- GitHub workflow 파일 수정
  - 개발 `.github/workflows/firebase-hosting-merge-dev.yml` 파일 수정
    - `workflow_dispatch:` 추가 - 수동으로 `workflow`를 실행 할 수 있는 이벤트
    - `target: development` 추가 - `Firebase Hosting` 배포 대상 지정

  - 테스트 `.github/workflows/firebase-hosting-merge-test.yml` 파일 수정
    - `workflow_dispatch:` 추가 - 수동으로 `workflow`를 실행 할 수 있는 이벤트
    - `target: test` 추가 - `Firebase Hosting` 배포 대상 지정

  - 운영 `.github/workflows/firebase-hosting-merge-prod.yml` 파일 수정
    - `workflow_dispatch:` 추가 - 수동으로 `workflow`를 실행 할 수 있는 이벤트
    - `target: production` 추가 - `Firebase Hosting` 배포 대상 지정
    ```yml
    # This file was auto-generated by the Firebase CLI
    # https://github.com/firebase/firebase-tools

    name: Deploy to Firebase Hosting on merge PROD
    'on':
      push:
        branches:
          - main
      workflow_dispatch:
    jobs:
      build_and_deploy:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v2
          # - run: yarn && yarn build
          - uses: FirebaseExtended/action-hosting-deploy@v0
            with:
              repoToken: '${{ secrets.GITHUB_TOKEN }}'
              firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT_NEXTJS_2022 }}'
              channelId: live
              projectId: nextjs-2022
              target: production
    ```

<br/><br/><br/>

---

<br/><br/><br/>

# 수동 배포
> - __[주의] `Cloud Run`이 배포 완료 된 후 `Firebase Hosting` 배포를 진행해야 함__
> - __최초 배포시 `Cloud Run` 생성이 안되어 있으면 `Firebase Hosting` 배포시 오류 발생__

## WEB에서 직접 배포
- GCP Cloud Run 배포
  > - https://console.cloud.google.com/cloud-build/triggers
  > - `GCP 콘솔 사이트` -> `Cloud Build` -> `트리거` 메뉴 이동
  > - 트리거 목록에서 해당 트리거 우측에 있는 `실행` 버튼 클릭

  ![GCP Cloud Build Trigger](https://github.com/lcs07/nextjs-firebase-docker/blob/dev/public/images/GCP_Cloud_Build_Trigger.png?raw=true)

  - 개발
    - 트리거 : `build-github-trigger-dev`

  - 테스트
    - 트리거 : `build-github-trigger-test`

  - 운영
    - 트리거 : `build-github-trigger-prod`

- Firebase Hosting 배포
  > - __[주의] `Cloud Run` 배포 완료 되었는지 확인 후 진행__
  > - https://docs.github.com/en/actions/managing-workflow-runs/manually-running-a-workflow
  > - `GitHub 사이트` -> `Actions` 메뉴 이동
  > - 좌측 `Workflows` 목록에서 해당 workflow 선택
  > - workflow 실행 목록 상단 우측의 `Run workflow` 버튼 클릭

  ![GitHub Actions Workflow](https://github.com/lcs07/nextjs-firebase-docker/blob/dev/public/images/GitHub_Actions_Workflow.png?raw=true)

  - 개발
    - workflow : `Deploy to Firebase Hosting on merge DEV`

  - 테스트
    - workflow : `Deploy to Firebase Hosting on merge TEST`

  - 운영
    - workflow : `Deploy to Firebase Hosting on merge PROD`

## 개발자 PC에서 직접 배포
- GCP Cloud Run 배포
  - 개발
    ```shell
    yarn cloudbuild:submit:dev
    ```

  - 테스트
    ```shell
    yarn cloudbuild:submit:test
    ```

  - 운영
    ```shell
    yarn cloudbuild:submit:prod
    ```

- Firebase Hosting 배포
  > - __[주의] `Cloud Run` 배포 완료 되었는지 확인 후 진행__

  - 개발
    ```shell
    yarn firebase:deploy:dev
    ```

  - 테스트
    ```shell
    yarn firebase:deploy:test
    ```

  - 운영
    ```shell
    yarn firebase:deploy:prod
    ```

<br/><br/><br/>

---

<br/><br/><br/>


