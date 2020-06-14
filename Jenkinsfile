node {

	def allowedBranches = ["master", "dev", "staging"];

	String branch = "${env.BRANCH_NAME}";
	String home = "${env.JENKINS_HOME}";
	String jobName = "${env.JOB_NAME}";

	if(!allowedBranches.contains(branch)){
		echo "skipping build";
		return
	}

	String env = "development";

	switch(branch){
		case "master":
		env = "production"
		break;
		case "staging":
		env = "staging"
		break;
	}

	try{

		stage("Checkout") {
			checkout scm
		}

		def result = sh (script: "git log -1 | grep '\\[ci skip\\]'", returnStatus: true)
		if (result != 0) {
			echo "performing build..."
		} else {
			echo "skipping build due to [ci skip]..."
			return
		}

		stage("Test") {
			sh "node -v"
			sh "npm prune"
			sh "npm install"
			sh "npm run lint"
		}

		lock("lock_${jobName}_${branch}"){
			stage("Build"){
				sh "${home}/deploy-scripts/docker-build-with-env.sh web-app ${env}"
			}

			stage("Deploy") {
				sh "${home}/deploy-scripts/deploy-aws.sh web-app ${env} public"
			}
		}

	} catch(e) {
    		if (!e.getMessage().contains('script returned exit code 143')) {
    			currentBuild.result = 'FAILURE'
    			step([$class: 'Mailer', notifyEveryUnstableBuild: true, recipients: 'yurii@dream-tek.io'])
    		}
    		throw e
    }

	stage("Cleanup") {
		sh "${home}/deploy-scripts/cache-invalidation.sh ${env}"
		sh "${home}/deploy-scripts/warming-cache-invalidation.sh ${env}"
		sh "npm prune"
		sh "rm node_modules -rf"
	}
}
