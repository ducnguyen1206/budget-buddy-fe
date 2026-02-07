pipeline {
    agent any

    tools {
        // Use the Node tool we configured earlier
        nodejs 'Node20' 
    }

    environment {
        // The path on your VPS where Nginx looks for files
        DEPLOY_PATH = "/var/www/budget-buddy"
        // Your VPS Username (e.g. ducnguy or root)
        VPS_USER = "ducnguyen" 
        // Your VPS IP (Internal IP usually works for Host access from Docker: 172.17.0.1)
        // OR use your Public IP if 172.17.0.1 fails (requires SSH port open)
        VPS_HOST = "172.17.0.1" 
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install & Build') {
            steps {
                echo '📦 Installing Dependencies...'
                // npm ci is faster/cleaner than npm install for CI
                sh 'npm ci' 
                
                echo '🏗️ Building React App...'
                sh 'npm run build'
                // This usually creates a 'dist' folder
            }
        }

        stage('Deploy') {
            steps {
                echo '🚀 Deploying to Nginx...'
                // Load the SSH Key we saved earlier (ID: vps-ssh-key)
                sshagent(['vps-ssh-key']) {
                    // 1. Scan the host key to avoid "unknown host" prompt
                    sh "mkdir -p ~/.ssh && ssh-keyscan -H ${VPS_HOST} >> ~/.ssh/known_hosts"
                    
                    // 2. Clear old files (Optional, but cleaner)
                    // We use SSH to run commands on the remote server
                    sh "ssh ${VPS_USER}@${VPS_HOST} 'rm -rf ${DEPLOY_PATH}/*'"
                    
                    // 3. Copy new files via SCP
                    // -r = recursive (copy folder)
                    sh "scp -r dist/* ${VPS_USER}@${VPS_HOST}:${DEPLOY_PATH}"
                }
            }
        }
    }
}