pipeline {
  agent {
    kubernetes {
      yaml '''
        apiVersion: v1
        kind: Pod
        spec:
          nodeSelector: 
            pv: monitoring
          containers:
          - name: docker
            image: jaydobariya/gitlab-ci:latestv1
            tty: true
            volumeMounts:
             - mountPath: /var/run/docker.sock
               name: docker-sock
          volumes:
          - name: docker-sock
            hostPath:
              path: /var/run/docker.sock    
        '''
    }
  }

  environment {
    BUILD_NAME = "sb11-backend-ms-payment-service"
    CI_COMMIT_SHA = sh(returnStdout: true, script: "git rev-parse HEAD").trim()
    GIT_COMMIT_EMAIL = sh (script: 'git --no-pager show -s --format=\'%ae\'',returnStdout: true).trim()
  }

  stages {
    stage('Backend MS Payment Service Development Build') {
      when {
        beforeInput true
        branch 'development'
      }

      environment{
        BUILD = "$BUILD_NAME" + "-development"
        ECR = "$SB11_ECR_URL" + "$BUILD"
      }

      steps {
        container('docker') {
          withCredentials([[
            $class: 'AmazonWebServicesCredentialsBinding', credentialsId: "${env.AWS_CREDS}", accessKeyVariable: 'AWS_ACCESS_KEY_ID', secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'], usernamePassword(credentialsId: "${env.SB11_HELM_CREDS}", usernameVariable: 'HELMUNAME', passwordVariable: 'HELMPW'), string(credentialsId: 'npm', variable: 'NPM_TOKEN')]) {

            sh ''' 
            aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID; aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY; aws configure set default.region $SB11_REGION
            aws eks --region $SB11_REGION update-kubeconfig --name SB11-Dev-Cluster
            helm repo add --username $HELMUNAME --password $HELMPW Sportsbuzz11 $SB11_HELM_URL/development
            helm repo update

            DOCKER_BUILDKIT=1 docker build . --network=host -t $ECR:$CI_COMMIT_SHA --build-arg NPM_TOKEN=$NPM_TOKEN --secret id=npmrc,src=.npmrc
            aws ecr get-login-password --region $SB11_REGION | docker login --username AWS --password-stdin $SB11_ECR_URL
            docker push $ECR:$CI_COMMIT_SHA
            helm upgrade --install -n development $BUILD Sportsbuzz11/$BUILD --set=image=$ECR:$CI_COMMIT_SHA
            kubectl rollout status -w deployment/$BUILD -n development
            '''
          }
        }
      }
    }
  
    stage('Backend MS Payment Service Staging Build') {
      when {
        beforeInput true
        branch 'staging'
      }

      environment{
        BUILD = "$BUILD_NAME" + "-staging"
        ECR = "$SB11_ECR_URL" + "$BUILD"
      }

      steps {
        container('docker') {
          withCredentials([[
            $class: 'AmazonWebServicesCredentialsBinding', credentialsId: "${env.AWS_CREDS}", accessKeyVariable: 'AWS_ACCESS_KEY_ID', secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'], usernamePassword(credentialsId: "${env.SB11_HELM_CREDS}", usernameVariable: 'HELMUNAME', passwordVariable: 'HELMPW')]) {

            sh ''' 
            aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID; aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY; aws configure set default.region $SB11_REGION
            aws eks --region $SB11_REGION update-kubeconfig --name sportgully
            helm repo add --username $HELMUNAME --password $HELMPW Sportsbuzz11 $SB11_HELM_URL/staging
            helm repo update
            
            DOCKER_BUILDKIT=1 docker build . --network=host -t $ECR:$CI_COMMIT_SHA --build-arg NPM_TOKEN=$NPM_TOKEN --secret id=npmrc,src=.npmrc
            aws ecr get-login-password --region $SB11_REGION | docker login --username AWS --password-stdin $SB11_ECR_URL
            docker push $ECR:$CI_COMMIT_SHA
            helm upgrade --install -n staging $BUILD Sportsbuzz11/$BUILD --set=image=$ECR:$CI_COMMIT_SHA
            kubectl rollout status -w deployment/$BUILD -n staging
            '''
          }
        }
      }
    }

    stage('Backend MS Payment Service Production Build') {
      when {
        beforeInput true
        branch 'production'
      }

      input {
        message "Should we continue for Production?"
        ok "Yes, we should."
        parameters {
          string(name: 'Approver Details', defaultValue: 'Your Notes/Name', description: 'Check Double, This is Production')
        }
      }

      environment{
        BUILD = "$BUILD_NAME" + "-production"
        ECR = "$SB11_ECR_URL" + "$BUILD"
      }

      steps {
        container('docker') {
          withCredentials([[
            $class: 'AmazonWebServicesCredentialsBinding', credentialsId: "${env.AWS_CREDS}", accessKeyVariable: 'AWS_ACCESS_KEY_ID', secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'], usernamePassword(credentialsId: "${env.SB11_HELM_CREDS}", usernameVariable: 'HELMUNAME', passwordVariable: 'HELMPW')]) {

            sh ''' 
            aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID; aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY; aws configure set default.region $SB11_REGION
            aws eks --region $SB11_REGION update-kubeconfig --name sportgully
            helm repo add --username $HELMUNAME --password $HELMPW Sportsbuzz11 $SB11_HELM_URL/main
            helm repo update

            DOCKER_BUILDKIT=1 docker build . --network=host -t $ECR:$CI_COMMIT_SHA --build-arg NPM_TOKEN=$NPM_TOKEN --secret id=npmrc,src=.npmrc
            aws ecr get-login-password --region $SB11_REGION | docker login --username AWS --password-stdin $SB11_ECR_URL
            docker push $ECR:$CI_COMMIT_SHA
            helm upgrade --install -n production $BUILD Sportsbuzz11/$BUILD --set=image=$ECR:$CI_COMMIT_SHA
            kubectl rollout status -w deployment/$BUILD -n production
            '''
          }
        }
      }
    }
  }
 }