// Database Diagram for diagramdb.io
// Copy and paste this content into diagramdb.io

// Collection: rooms
CREATE TABLE rooms (
  _id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);

// Collection: messages
CREATE TABLE messages (
  _id UUID PRIMARY KEY,
  sender VARCHAR(255) NOT NULL,
  text TEXT NOT NULL,
  roomId UUID NOT NULL,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY (roomId) REFERENCES rooms(_id)
);

// Indexes
CREATE INDEX idx_messages_roomId ON messages(roomId);
