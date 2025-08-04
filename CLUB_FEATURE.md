# Club Feature Documentation

## Overview
The Club feature allows users to create and join communities based on different categories. Users can share content within their clubs, interact with other members, and build communities around shared interests.

## Features Implemented

### 1. Club Categories
The system supports 15 different club categories:
- 📺 Media Clubs
- 🎭 Cultural
- 📚 Academic
- 💬 Debate
- 🤝 NGOs
- ❤️ Community Service
- 🌍 Country
- 🏛️ Fraternities and Sororities
- 💼 Professional
- 🔗 Association
- 🎨 Arts
- 🎬 Film
- 🤝 Fraternal
- ⛪ Religious
- 🕊️ Spiritual Organizations

### 2. Club Management
- **Create Clubs**: Users can create new clubs with name, description, category, and privacy settings
- **Join/Leave Clubs**: Users can join public clubs directly or request to join private clubs
- **Club Privacy**: Clubs can be set as public (anyone can join) or private (requires approval)
- **Club Images**: Support for club profile images and cover images

### 3. Club Posts
- **Create Posts**: Club members can create posts with text and images
- **View Posts**: All club posts are displayed in chronological order
- **Post Interactions**: Posts show like and comment counts (backend ready for full implementation)

### 4. Member Management
- **Member Roles**: Owner, Admin, Moderator, Member roles
- **Member List**: View all club members with their roles
- **Join Requests**: For private clubs, users can send join requests with messages

## Database Schema

### New Models Added:

#### Club
```prisma
model Club {
  id          String       @id @default(cuid())
  name        String
  description String       @db.Text
  category    ClubCategory
  image       String?
  coverImage  String?
  isPrivate   Boolean      @default(false)
  isActive    Boolean      @default(true)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  ownerId     String
  owner       User         @relation("ClubOwner", fields: [ownerId], references: [id], onDelete: Cascade)
  
  members     ClubMember[]
  posts       ClubPost[]
  joinRequests ClubJoinRequest[]
}
```

#### ClubMember
```prisma
model ClubMember {
  id        String   @id @default(cuid())
  role      String   @default("member") // owner, admin, moderator, member
  joinedAt  DateTime @default(now())
  userId    String
  clubId    String
  user      User     @relation("ClubMembers", fields: [userId], references: [id], onDelete: Cascade)
  club      Club     @relation(fields: [clubId], references: [id], onDelete: Cascade)

  @@unique([userId, clubId])
}
```

#### ClubPost
```prisma
model ClubPost {
  id        String   @id @default(cuid())
  content   String   @db.Text
  image     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  authorId  String
  clubId    String
  author    User     @relation("ClubPostAuthor", fields: [authorId], references: [id], onDelete: Cascade)
  club      Club     @relation(fields: [clubId], references: [id], onDelete: Cascade)

  clubComments ClubComment[]
  clubLikes    ClubLike[]
}
```

## API Endpoints

### Club Management
- `POST /api/clubs` - Create a new club
- `GET /api/clubs` - Get all clubs with filtering
- `GET /api/clubs/user` - Get user's clubs
- `GET /api/clubs/:id` - Get club by ID
- `POST /api/clubs/:id/join` - Join a club
- `DELETE /api/clubs/:id/leave` - Leave a club

### Club Posts
- `POST /api/clubs/:id/posts` - Create a club post
- `GET /api/clubs/:id/posts` - Get club posts

## Frontend Components

### Pages
1. **Clubs.jsx** - Main clubs listing page with search and filtering
2. **ClubDetail.jsx** - Individual club page with posts and member management

### Components
1. **CreateClubModal.jsx** - Modal for creating new clubs
2. **ClubService.js** - Service for API calls

## Usage

### Creating a Club
1. Navigate to the Clubs page
2. Click "Create Club" button
3. Fill in club details (name, description, category)
4. Optionally upload an image and set privacy
5. Submit the form

### Joining a Club
1. Browse clubs on the Clubs page
2. Click "Join" on any public club
3. For private clubs, a join request will be sent

### Posting in a Club
1. Navigate to a club you're a member of
2. Use the post creation form at the top
3. Add text and optionally an image
4. Submit the post

## Navigation
The Clubs feature is accessible through:
- Sidebar navigation: "Clubs" menu item
- Direct URL: `/clubs` for listing, `/clubs/:id` for individual clubs

## Future Enhancements
- Club post likes and comments functionality
- Club admin panel for managing members
- Club events and announcements
- Club analytics and insights
- Club search and discovery improvements
- Club notifications for members

## Technical Notes
- All club operations require authentication
- Image uploads are handled with Multer middleware
- Club posts support both text and image content
- The system uses Prisma ORM for database operations
- Real-time updates can be added using Socket.IO 