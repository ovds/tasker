let video, classifier, mobilenet, label, started, m;
let s = 0.9;
label = "";
let imgs = {};

function setup() {
    var cnv = createCanvas(480, 360);
    cnv.parent('login');
    video = createCapture(VIDEO);
    video.hide();
    mobilenet = ml5.featureExtractor("MobileNet", () => {
        console.log("|Model Ready|");
        //loadM();
    });
    classifier = mobilenet.classification(video);


    m = width * (3/5);
}

function loadM() {
    setTimeout(classifier.load("model/model.json", () => {
        console.log("its nerding time");
        classifier.classify(gotResults);
    }), 5000);
}

function windowResized() {
    var a, b = 0;
    if (windowWidth/4 < windowHeight/3) {
        a = windowWidth/4;
        b = (a/4) * 4
    } else {
        b = windowHeight/3;
        a = b/3 * 5;
    }

    s = a / 480;
    resizeCanvas(a, b);
}

var i = 0;

function draw() {
    background(0);

    push();
    translate(width, 0);
    scale(-s, s);
    image(video, 0, 0)
    pop();

    if (started) {
        stroke(255);
        strokeWeight(3);
        noFill()
        rect(width * (1/5) - 3, height/2 - 23, width * 3/5 + 6, 46);
        noStroke();
        fill(80, 200, 120);
        rect(width * (1/5), height/2 - 20, width * (3/5) - m , 40);
    }

    i++;
    if (i == 20) {
        console.log(label);
        i = 0;
    }
}

function addImg(name, n) {
    console.log("image added")
    classifier.addImage(name.value)
    if (imgs[name.value] == null) {imgs[name.value] = []};
    imgs[name.value].push(video.get(0, 0, video.width, video.height));
    classifier.addImage(video.get(0, 0, video.width, video.height), name.value);
}

function train() {

    console.log("Training");
    classifier.train(loss => {
        if (loss != null) {
            console.log(loss);
        } else {
            console.log("Training Complete!")
            classifier.classify(gotResults);
            // classifier.save(() => {
            //     console.log("saved")
            // }, "itsnerdingtime");
        }
    });
}

function gotResults(error, result) {
    if (error) {
        console.error(error);
    } else if (result[0].confidence * 100 > 80) {
        label = result[0].label + " " + nf(result[0].confidence * 100, 2, 2) + "%";
        classifier.classify(gotResults);
    } else {
        label = "";
    }
}

const sleepNow = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

async function start(name) {
    started = true;
    for (var i = 0; i < 20; i++) {
        await sleepNow(1000);
        addImg(name, i+1);
        m -= (width * (3/5) / 20)
        if (m < 5) {setTimeout(() => {started = false; m = width * (3/5)}, 1000)}
    }
    await sleepNow(10 * 1000);
    setTimeout(train(), 25 * 1000);
}

function checkVerified() {
    return label.length > 1;
}

function login() {
    // let customAlert = new CustomAlert();

    // if (document.getElementById("name").value === "" || document.getElementById('password').value === "") {
    //     //customAlert.alert("Fill in both blanks!", "Warning");
    // }

    const XHR = new XMLHttpRequest();
    const FD = new FormData();

    var data = {username: document.getElementById("name").value,
                password: document.getElementById("password").value,
                verified: checkVerified()};

    // Push our data into our FormData object
    for (const [name, value] of Object.entries(data)) {
        FD.append(name, value);
    }

    XHR.onreadystatechange = function () {
        if(this.readyState === 4 && this.status === 200){
            switch(XHR.response.text){
                case "Valid":
                    window.location.href = "home.html";
                    document.cookie = "username=" + document.getElementById('name').value;
                    break;
                case "Invalid":
                    alert("Invalid password or username!");
                    break;
                    //customAlert.alert("Wrong password or username!" , "Incorrect!");
            }
        }
    }

    // Define what happens on successful data submission
    XHR.addEventListener('load', (event) => {
        alert('Yeah! Data sent and response loaded.');
    });

    // Set up our request
    XHR.open('POST', 'https://tasker-nushhack.herokuapp.com/login');

    // Send our FormData object; HTTP headers are set automatically
    XHR.send(FD);
}

function reg() {
    const XHR = new XMLHttpRequest();
    const FD = new FormData();

    const data = {name: document.getElementById("nam").value,
                  password: document.getElementById("pasw")};

    // Push our data into our FormData object
    for (const [name, value] of Object.entries(data)) {
        FD.append(name, value);
    }

    // Define what happens on successful data submission
    XHR.addEventListener('load', (event) => {
        alert('Yeah! Data sent and response loaded.');
    });

    // Define what happens in case of error
    XHR.addEventListener('error', (event) => {
        alert('Oops! Something went wrong.');
    });

    // Set up our request
    XHR.open('POST', 'https://tasker-nushhack.herokuapp.com/register');

    // Send our FormData object; HTTP headers are set automatically
    XHR.send(FD);
    // Send the data
    XHR.send(data);
}