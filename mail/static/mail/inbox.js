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
        body: formData.get("body")
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

function open_email(event) { // criar uma função de componente para essa merda de email.
  emailEl = event.currentTarget;
  emailId = emailEl.id;
  document.querySelector("#emails-view").style.display = 'none';
  document.querySelector("#open-email").style.display = 'block';
  fetch(`/emails/${emailId}`)
  .then(response => response.json())
  .then(data => {
    emailsInfo = `From:${data.sender}\n To:${data.recipients}\n Subject${data.subject}\n Body:${data.body}\n Timestamp${data.timestamp}`;
    document.querySelector("#email-info").innerHTML = emailsInfo;
  });
}

function emailElement(emailData) {
  const emailContainer = Object.assign(document.createElement("div"), {
    className: "email-container",
    id: emailData.id,
    onclick: ((event) => open_email(emailData, event))
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
