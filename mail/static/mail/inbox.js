document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  
  document.querySelector("#compose-form").addEventListener("submit", handle_submit);
});

function compose_email() {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector("#open-email").style.display = 'none';
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector("#open-email").style.display = 'none';
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  let dataArr = [];
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(data => { // este fetch retorna uma lista de jsons cada um para um email.
    console.log(data)
    data.forEach(email => {
      document.querySelector("#emails-view").appendChild(emailElement(email));
    })
    console.log(dataArr)
  });

  

}

function handle_submit(event) {
  event.preventDefault();
  const formElement = event.currentTarget;
  const formData = new FormData(formElement);

  console.log(formData);

  fetch('/emails', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
        recipients: formData.get("recipients"),
        subject: formData.get("subject"),
        body: (() => isReply(formData.get("body"), formData.get("sender")))()  
    })
  })
  .then(response => response.json())
  .then(result => {
      document.querySelector("#response-message").innerHTML = result? result.message: "Carregando...";
      if (result.message === "Email sent successfully.") {
        load_mailbox('inbox');
      }
      else {
        formElement.recipients.value = '';
        formElement.subject.value = '';
        formElement.body.value = '';
      }
  });
}

function open_email(event, emailId) { // criar uma função de componente para essa merda de email.
  emailEl = event.currentTarget;
  emailId = emailEl.id;
  document.querySelector("#emails-view").style.display = 'none';
  document.querySelector("#open-email").style.display = 'block';
  fetch(`/emails/${emailId}`)
  .then(response => response.json())
  .then(data => {
    showEmailComponent(data);
    document.querySelector("#reply-btn").addEventListener('click', () => replyEmail(data))
  });
  
}


function replyEmail(data) {
  compose_email()
  document.querySelector('#compose-recipients').value = data.sender;
  if (data.subject.includes("Re:")) {
    document.querySelector('#compose-subject').value = data.subject;
  } else {
    document.querySelector('#compose-subject').value = `Re: ${data.subject}`;
  }
  if (!data.subject.includes("Re:")){
    document.querySelector('#compose-body').value = `On ${data.timestamp} ${data.sender} wrote: ${data.body}\nReply: `;
  } else {
    document.querySelector('#compose-body').value = `${data.body}\nReply: `;
  }

}

function isReply(body, sender){
  if (body.includes("Reply:")){
    console.log(`O sender é: ${sender}`)
    const timeStamp = getTimeStamp()
    console.log(timeStamp)
    const bodyLog = body.split("Reply:")
    console.log(bodyLog)
    return `${bodyLog[0]}\nOn ${timeStamp} ${sender} wrote: ${bodyLog[1]}`;
  }
  return body
}

function getTimeStamp(){
  const now = new Date()
  return now.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

// Components functions

function showEmailComponent(data) {
  document.querySelector("#se-from").textContent = data.sender;
  document.querySelector("#se-to").textContent = data.recipients;
  document.querySelector("#se-subject").textContent = data.subject;
  document.querySelector("#se-timestamp").textContent = data.timestamp;
  document.querySelector("#se-body").textContent = data.body;
}

function emailElement(emailData) {
  const emailContainer = Object.assign(document.createElement("div"), {
    className: "email-container",
    id: emailData.id,
    onclick: ((event) => open_email(event))
  });
  const emailSender = Object.assign(document.createElement("span"), {
    className: "email-sender"
  });
  const strongText = Object.assign(document.createElement("strong"), {
    textContent: emailData.sender
  });
  emailSender.appendChild(strongText);

  const emailSubject = Object.assign(document.createElement("span"), {
    className: "email-subject",
    textContent: emailData.subject
  });
  const emailTimeStp = Object.assign(document.createElement("span"), {
    className: "email-time-stp",
    textContent: emailData.timestamp
  });

  emailContainer.appendChild(emailSender);
  emailContainer.appendChild(emailSubject);
  emailContainer.appendChild(emailTimeStp);

  return emailContainer;
}
