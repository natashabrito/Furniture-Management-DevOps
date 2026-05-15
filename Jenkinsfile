pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build and Start Containers') {
            steps {
                // NOTE: If your Jenkins is installed directly on Windows, change 'sh' to 'bat'
                sh 'docker compose down'
                sh 'docker compose up -d --build'
            }
        }

        stage('Verify') {
            steps {
                // Give containers a few seconds to start
                sleep time: 10, unit: 'SECONDS'
                
                // Verify the backend is responding (change 'sh' to 'bat' if on Windows)
                sh 'curl -s -f http://localhost:5000/furniture > /dev/null'
            }
        }
    }

    post {
        success {
            echo 'Successfully built and started the Furniture DevOps application!'
        }
        failure {
            echo 'Pipeline failed. Please check the logs.'
            // Optionally shut down containers if the test fails
            // sh 'docker compose down'
        }
    }
}
