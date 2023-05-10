import { View, Text, TextInput, FlatList, Image, TouchableOpacity, SafeAreaView, StyleSheet, ActivityIndicator } from 'react-native';
import React, { useEffect, useState, useLayoutEffect } from 'react';
import { database, auth } from '../config/firebase';
import { ref, onValue, push, remove } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';

const Home = () => {

  const navigation = useNavigation();
  // State variables
  const [users, setUsers] = useState(null); // all users in the database
  const [searchQuery, setSearchQuery] = useState(''); // search query for filtering users
  const [friends, setFriends] = useState([]); // current user's friends
  const [username, setUsername] = useState([]); // current user's username
  const [currentUser, setCurrentUser] = useState([]); // current user's data
  
 //Delete the title on the top of the screen 
 
 useLayoutEffect(() => {
 navigation.setOptions({
     headerShown:false,
 });
 }, []);
  // Fetch all users from the database and update state variables
  useEffect(() => {
    const getUsersRef = ref(database, 'users/');
    onValue(getUsersRef, (snapshot) => {
      const data = snapshot.val();
      const theUsers = Object.keys(data).map(key => ({
        uid:key,
        ...data[key]
      }));
      setUsers(theUsers);
      // Get current user's data
      const currentUserData = theUsers.find(user => user.uid === auth.currentUser.uid);
      setCurrentUser(currentUserData);
      // Get current user's friends
      if (currentUserData.friends) {
        const friendIds = Object.keys(currentUserData.friends);
        const theFriends = friendIds.map(id => currentUserData.friends[id]);
        setFriends(theFriends);
      }
    });
  }, []);
  

  // Filter users based on search query
  const filteredUsers = users ? users.filter(item => item.username?.toLowerCase().includes(searchQuery?.toLowerCase())) : null;
  
  // Navigate to chat screen when a friend is clicked
  const navigateToChat = (friend) => {
    navigation.navigate('Chat', { selectedUser: friend });
  };

  // Add a new friend to the current user's friend list
  const addToFriends = async (friend) => {
    const currentUserId = auth.currentUser.uid;
    const currentUsername = users.find(user => user.uid === currentUserId).username;
    const friendInfo = users.find(user => user.uid === friend.uid);
    const friendId = friendInfo.uid;

    // Check if the user is already a friend
    const isFriend = friends.some(f => f.uid === friend.uid);
    if (isFriend) {
      console.log(`${friendInfo.username} is already a friend.`);
      return;
    }

    // Check if the friend is the current user
    if (friendId === currentUserId) {
      console.log(`You cannot add yourself as a friend.`);
      return;
    }

    // Create a new chatroom for the new friendship
    const newChatroomRef = await push(ref(database, `chatrooms`), {firstUser: currentUsername, secondUser: friendInfo.username, messages: [],});   
    const newChatroomId = newChatroomRef.key;
    // Update the friend lists for both users
    await push(ref(database, `users/${currentUserId}/friends`), { uid: friend.uid, username: friendInfo.username, chatroomId: newChatroomId, });
    await push(ref(database, `users/${friendId}/friends`), { uid: currentUserId, username: currentUsername, chatroomId: newChatroomId, });

    const updatedFriends = [...friends, { uid: friend.uid, username: friendInfo.username }];
    setFriends(updatedFriends);
  };
  
// Remove a friend from the current user's friend list
const removeFromFriends = async (friend) => {
    const currentUserId = auth.currentUser.uid;
    const currentUsername = users.find(user => user.uid === currentUserId).username;
    const friendInfo = users.find(user => user.uid === friend.uid);
    const friendId = friendInfo.uid;
    const chatroomId = friend.chatroomId;

  // Remove friend from the current user's friend list
    // Update the friend lists for both users
    await remove(ref(database, `users/${currentUserId}/friends`), { uid: friend.uid, username: friendInfo.username, });
    await remove(ref(database, `users/${friendId}/friends`), { uid: currentUserId, username: currentUsername, });

  // Remove chatroom associated with the friend
  await remove(ref(database, `chatrooms/${chatroomId}`));

  // Update the local state to remove the friend
  const updatedFriends = friends.filter(f => f.uid !== friendId);
  setFriends(updatedFriends);
};

  return (
<SafeAreaView style={styles.container}>
  <View style={styles.header}>
    <Image
      source={{ uri: 'https://cdn-icons-png.flaticon.com/128/9341/9341600.png' }}
      style={styles.logo}
    />
    <View style={styles.searchContainer}>
      <Image source={require('../assets/search.png')} style={styles.searchIcon} />
      <TextInput
        placeholder="Search Username "
        placeholderTextColor="#fff"
        value={searchQuery}
        style={styles.searchInput}
        onChangeText={setSearchQuery}
      />
    </View>
  </View>
  {searchQuery && filteredUsers && filteredUsers.length > 0 ? (
    <FlatList
      data={filteredUsers}
      renderItem={({ item }) => (
        <View style={styles.chatItem}>
          <Image 
            source={require('../assets/user.png')} 
            style={{height:60, width:60, marginLeft: 10, marginRight:10, marginBottom:10, borderRadius:50}}/>
          <Text style={[styles.name, {flex: 1}]}>{item.username}</Text>
          <TouchableOpacity onPress={() => addToFriends(item)} style={{paddingRight: 10}}>
            <Image source={require('../assets/addFriend.png')} style={styles.addIcon} />
          </TouchableOpacity>
        </View> 
      )}
      keyExtractor={item => item.uid}
    />
  ) : (
    searchQuery ?  
      <View style={styles.center}>
        <Text style={styles.noUsersText}>No users found</Text>
      </View> : null
  )}
  <Text style={styles.friendsTitle}>Friends:</Text>
  {friends.length > 0 ? (
    <FlatList
      data={friends}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.chatItem} onPress={() => navigateToChat(item)}>
          <Image 
            source={require('../assets/user.png')}
            style={{height:60, width:60, marginLeft: 10, marginRight:10, marginBottom:10, borderRadius:50}}/>
          <Text style={[styles.name, {flex: 1}]}>{item.username}</Text>
          <TouchableOpacity onPress={() => removeFromFriends(item)} style={{paddingRight: 10}}>
            <Image source={require('../assets/deleteFriend.png')} style={styles.addIcon} />
          </TouchableOpacity>
        </TouchableOpacity>
      )}
      keyExtractor={item => item.uid}
    />
  ) : (
    <View style={styles.center}>
      <Text style={styles.noUsersText}>You have no friends yet.</Text>
      <ActivityIndicator size="large" color="#2E86C1" />
    </View>
  )}
</SafeAreaView>

  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333',
  },
 header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginHorizontal: 25,
    marginBottom:'5%'
  },
  logo: {
    width: 35,
    height: 35,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    height:40,
    backgroundColor: '#222',
    borderRadius: 10,
    marginLeft:'10%'
  },
  searchInput: {
    flex: 1,
    height:40,
    borderRadius: 12,
    color: '#fff',
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor:'#222'
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginLeft:6
  },
  addIcon: {
    width: 20,
    height: 20,
  },
  friendsTitle: {
    fontSize: 20, 
    color:'#fff', 
    marginBottom: 20,
    marginLeft:20,
  },
  center: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  },
  noUsersText: {
  color: '#fff',
  fontSize: 16,
  marginBottom:15
  },
  chatItem: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth:0.5,
    borderBottomColor:'#aaa',
    marginHorizontal:25,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 25,
  },
  name: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
    marginRight: 10
  },
});


export default Home;
