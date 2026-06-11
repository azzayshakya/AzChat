# AZ Chat

AZ Chat is a **real-time communication platform** designed for teams, organizations, and educational environments where fast, secure, and professional communication matters. The application provides direct messaging, group collaboration, presence tracking, professional status updates, and useful productivity tools within a single interface.

Built with a focus on simplicity and efficiency, AZ Chat delivers a modern messaging experience powered by WebSockets for real-time updates.

---

## 🚀 Key Features

### 🟢 Real-Time Online Presence

AZ Chat tracks user availability at the **browser-tab level**.

* Users appear online as long as the AZ Chat tab remains open.
* Presence updates occur instantly using WebSockets.
* Green indicators show active users.
* No manual refresh is required for status synchronization.

---

### 💬 Direct Messaging

Communicate instantly with other registered users.

* Login using either **email** or **username**.
* Search and discover users quickly.
* Real-time message delivery.
* Message delivery and read receipts.
* Clean and responsive chat interface.

---

### 👥 Group Chats

Collaborate effectively through role-based group conversations.

#### Group Roles

**Creator**

* Full control over the group.
* Can manage all members and roles.
* Can delete the group.

**Admin**

* Can invite new members.
* Helps manage group participation.

**Member**

* Can participate in conversations.
* Can access group content.

Additional capabilities:

* Promote members to administrators.
* Organized permission hierarchy.
* Structured group management.

---

### 📌 Professional Work Status

Share what you are currently working on.

Examples:

> Working on Authentication Module
> Fixing Notification Service Bugs
> Preparing Sprint 5 Deployment

Features include:

* Professional project updates.
* Public or contact-only visibility options.
* Instant status publishing.
* Delete or update statuses anytime.

---

### 📊 Attendance Calculator

A built-in utility designed for students and professionals.

Capabilities:

* Calculate attendance percentage instantly.
* Understand your current attendance standing.
* Determine how many additional classes can be missed while maintaining a target percentage.
* Eliminate the need for external spreadsheets or calculators.

---

### 🗑 Automatic Message Cleanup

AZ Chat automatically manages storage and privacy.

* All direct and group messages older than **10 days** are deleted automatically.
* Cleanup occurs in the background without user intervention.
* Deleted messages cannot be recovered.
* Helps maintain privacy and reduces unnecessary storage usage.

---

## ⚡ Real-Time Architecture

AZ Chat uses **WebSocket communication** to provide a seamless messaging experience.

Real-time events include:

* Incoming messages
* Presence updates
* Group activities
* Read receipts
* Status synchronization

This architecture ensures users receive updates immediately without repeatedly refreshing the application.

---

## 🎯 Purpose of AZ Chat

AZ Chat was created to provide a communication platform that combines:

* Professional collaboration,
* Educational utility,
* Real-time responsiveness,
* Simple user experience.

Whether used within a company, college environment, or small development team, AZ Chat aims to make communication efficient and organized.

---

## 🛠 Technology Stack

The application is built using modern web technologies.

### Frontend

* React
* Vite
* Ant Design
* Socket.IO Client

### Backend

* Node.js
* Express.js
* Socket.IO

### Database

* JSON-based data persistence *(current implementation)*

---

## 🔐 Privacy Philosophy

AZ Chat prioritizes simplicity and responsible data handling.

* Temporary message retention.
* Automatic cleanup policies.
* Controlled group permissions.
* Professional status sharing.

---

## 📌 Version

**AZ Chat v2.7.1**

Developed by **AZZAYSHAKYA**

---

> *"Simple, real-time communication designed for productive conversations."*
