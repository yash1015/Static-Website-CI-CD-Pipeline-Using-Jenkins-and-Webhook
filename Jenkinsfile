pipeline {
agent any


stages {

    stage('Install Dependencies') {
        steps {
            sh 'npm install'
        }
    }

    stage('Run Tests') {
        steps {
            sh 'npm test'
        }
    }

    stage('Build Docker Image') {
        steps {
            sh 'docker build -t node-app .'
        }
    }

    stage('Stop Old Container') {
        steps {
            sh 'docker rm -f node-container || true'
        }
    }

    stage('Run New Container') {
        steps {
            sh 'docker run -d -p 3000:3000 --name node-container node-app'
        }
    }

}

post {
    success {
        echo '✅ Pipeline completed successfully. Application deployed.'
    }
    failure {
        echo '❌ Pipeline failed. Check logs pls.'
    }
}


}

