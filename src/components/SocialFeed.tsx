"use client";

import { useState } from "react";
import Link from "next/link";

interface ActivityPost {
  id: string;
  userId: string;
  username: string;
  workoutType: string;
  duration: string;
  xpGained: number;
  message?: string;
  kudosCount: number;
  hasLiked: boolean;
  createdAt: string;
  avatarUrl?: string;
}

interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  challengeType: "workouts" | "streak" | "xp";
  targetValue: number;
  currentProgress: number;
  participantsCount: number;
  daysLeft: number;
  isJoined: boolean;
}

export default function SocialFeed({ userId }: { userId: string }) {
  const [posts, setPosts] = useState<ActivityPost[]>([
    {
      id: "1",
      userId: "user1",
      username: "Alex",
      workoutType: "Musculation",
      duration: "45 min",
      xpGained: 150,
      message: "Séance épaule/triceps aujourd'hui ! 💪",
      kudosCount: 8,
      hasLiked: false,
      createdAt: "2024-01-15T10:30:00Z",
      avatarUrl: "/default-avatar.png"
    },
    {
      id: "2",
      userId: "user2",
      username: "Sarah",
      workoutType: "Cardio",
      duration: "30 min",
      xpGained: 120,
      message: "Course à pied ce matin, super énergie ! 🏃‍♀️",
      kudosCount: 12,
      hasLiked: true,
      createdAt: "2024-01-15T08:15:00Z",
      avatarUrl: "/default-avatar.png"
    },
    {
      id: "3",
      userId: "user3",
      username: "Mike",
      workoutType: "Yoga",
      duration: "60 min",
      xpGained: 100,
      message: "Séance de yoga pour bien commencer la semaine 🧘‍♂️",
      kudosCount: 5,
      hasLiked: false,
      createdAt: "2024-01-15T07:00:00Z",
      avatarUrl: "/default-avatar.png"
    }
  ]);

  const [challenges] = useState<CommunityChallenge[]>([
    {
      id: "1",
      title: "Défi 30 jours",
      description: "30 séances en 30 jours",
      challengeType: "workouts",
      targetValue: 30,
      currentProgress: 15,
      participantsCount: 45,
      daysLeft: 15,
      isJoined: true
    },
    {
      id: "2",
      title: "Streak de 7 jours",
      description: "7 jours consécutifs d'entraînement",
      challengeType: "streak",
      targetValue: 7,
      currentProgress: 3,
      participantsCount: 128,
      daysLeft: 4,
      isJoined: false
    }
  ]);

  const handleKudos = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          kudosCount: post.hasLiked ? post.kudosCount - 1 : post.kudosCount + 1,
          hasLiked: !post.hasLiked
        };
      }
      return post;
    }));
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}j`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* En-tête du feed */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Feed Communautaire</h2>
          <Link 
            href="/challenges" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voir les défis
          </Link>
        </div>
        
        {/* Statistiques rapides */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">12</div>
            <div className="text-sm text-gray-600">Amis actifs</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600">3</div>
            <div className="text-sm text-gray-600">Défis en cours</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-600">156</div>
            <div className="text-sm text-gray-600">Kudos reçus</div>
          </div>
        </div>
      </div>

      {/* Challenges communautaires */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Défis en cours</h3>
        <div className="space-y-4">
          {challenges.map(challenge => (
            <div key={challenge.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{challenge.title}</h4>
                <span className="text-sm text-gray-500">{challenge.daysLeft}j restants</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
              
              {/* Barre de progression */}
              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progression</span>
                  <span>{challenge.currentProgress}/{challenge.targetValue}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(challenge.currentProgress / challenge.targetValue) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {challenge.participantsCount} participants
                </span>
                {challenge.isJoined ? (
                  <span className="text-sm text-green-600 font-medium">✓ Rejoint</span>
                ) : (
                  <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors">
                    Rejoindre
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feed d'activité */}
      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
            {/* En-tête du post */}
            <div className="flex items-center mb-4">
              <img 
                src={post.avatarUrl || "/default-avatar.png"} 
                alt={post.username}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{post.username}</div>
                <div className="text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</div>
              </div>
            </div>

            {/* Contenu du post */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">
                    {post.workoutType === "Musculation" && "🏋️"}
                    {post.workoutType === "Cardio" && "🏃‍♀️"}
                    {post.workoutType === "Yoga" && "🧘‍♂️"}
                  </span>
                  <span className="font-medium text-gray-900">{post.workoutType}</span>
                  <span className="text-gray-500">• {post.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-500">⭐</span>
                  <span className="font-medium text-gray-900">+{post.xpGained} XP</span>
                </div>
              </div>
              
              {post.message && (
                <p className="text-gray-700">{post.message}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <button 
                onClick={() => handleKudos(post.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  post.hasLiked 
                    ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{post.hasLiked ? '💪' : '👊'}</span>
                <span className="font-medium">{post.kudosCount}</span>
              </button>
              
              <div className="flex space-x-4">
                <button className="text-gray-500 hover:text-gray-700 transition-colors">
                  💬 Commenter
                </button>
                <button className="text-gray-500 hover:text-gray-700 transition-colors">
                  📤 Partager
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Call-to-action pour ajouter des amis */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white text-center">
        <h3 className="text-lg font-semibold mb-2">Rejoins la communauté GRIND !</h3>
        <p className="text-blue-100 mb-4">
          Connecte-toi avec tes amis et motive-toi ensemble
        </p>
        <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
          Inviter des amis
        </button>
      </div>
    </div>
  );
} 